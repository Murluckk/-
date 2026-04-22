//! keccak-of-address vanity miner.
//!
//! Searches for secp256k1 private keys whose Ethereum address `A` satisfies
//!     keccak256(A)[0..prefix_len] == target_prefix
//!
//! Default: prefix = 0x00000000 (4 bytes). Configurable via CLI.
//!
//! This is the hash-of-address twist on the classic "profanity" style miner:
//! instead of matching leading nibbles of the address itself, we match leading
//! bytes of keccak256(address_bytes_20).

use std::sync::Arc;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::time::{Duration, Instant};

use clap::Parser;
use rand::rngs::OsRng;
use rand::RngCore;
use rayon::prelude::*;
use secp256k1::{PublicKey, Secp256k1, SecretKey};
use tiny_keccak::{Hasher, Keccak};

#[derive(Parser, Debug)]
#[command(
    author,
    version,
    about = "Search for EOAs whose keccak256(address) has a given byte prefix"
)]
struct Cli {
    /// Target prefix in hex (applied to keccak256(address)). Example: 00000000
    #[arg(long, default_value = "00000000")]
    prefix: String,

    /// Number of worker threads. 0 = use all logical cores.
    #[arg(long, default_value_t = 0)]
    threads: usize,

    /// Stop after finding this many matches. 0 = run until Ctrl+C.
    #[arg(long, default_value_t = 1)]
    count: u64,

    /// Benchmark mode: run for N seconds and print throughput, no matching.
    #[arg(long, default_value_t = 0)]
    bench: u64,

    /// Print progress every N seconds.
    #[arg(long, default_value_t = 2)]
    report_interval: u64,
}

fn parse_prefix(s: &str) -> Vec<u8> {
    let s = s.trim().trim_start_matches("0x");
    if s.is_empty() {
        return Vec::new();
    }
    if s.len() % 2 != 0 {
        eprintln!("error: --prefix must have an even number of hex characters");
        std::process::exit(2);
    }
    match hex::decode(s) {
        Ok(v) => {
            if v.len() > 32 {
                eprintln!("error: prefix cannot be longer than 32 bytes (keccak256 output)");
                std::process::exit(2);
            }
            v
        }
        Err(e) => {
            eprintln!("error: invalid hex prefix: {e}");
            std::process::exit(2);
        }
    }
}

/// Derive 20-byte Ethereum address from a secp256k1 public key.
#[inline(always)]
fn address_from_pubkey(pk: &PublicKey) -> [u8; 20] {
    let ser = pk.serialize_uncompressed(); // 65 bytes: 0x04 || X || Y
    let mut k = Keccak::v256();
    k.update(&ser[1..]);
    let mut out = [0u8; 32];
    k.finalize(&mut out);
    let mut addr = [0u8; 20];
    addr.copy_from_slice(&out[12..]);
    addr
}

#[inline(always)]
fn keccak_of_address(addr: &[u8; 20]) -> [u8; 32] {
    let mut k = Keccak::v256();
    k.update(addr);
    let mut out = [0u8; 32];
    k.finalize(&mut out);
    out
}

#[inline(always)]
fn has_prefix(hash: &[u8; 32], prefix: &[u8]) -> bool {
    hash[..prefix.len()] == *prefix
}

/// Increment a 32-byte big-endian scalar in place (wrapping).
#[inline(always)]
fn inc_be(buf: &mut [u8; 32]) {
    for byte in buf.iter_mut().rev() {
        let (v, carry) = byte.overflowing_add(1);
        *byte = v;
        if !carry {
            return;
        }
    }
}

struct Shared {
    stop: AtomicBool,
    tried: AtomicU64,
    found: AtomicU64,
    prefix: Vec<u8>,
    target_count: u64,
}

fn worker_loop(shared: &Shared, secp: &Secp256k1<secp256k1::All>) {
    // Each worker starts from a fresh random 32-byte seed, then increments it.
    // secp256k1 curve order is slightly below 2^256, so wrap-around is harmless
    // (we'll just hit a few invalid scalars per ~2^128 tries).
    let mut seed = [0u8; 32];
    OsRng.fill_bytes(&mut seed);

    const BATCH: u64 = 1024;
    let mut local_tries: u64 = 0;

    loop {
        if shared.stop.load(Ordering::Relaxed) {
            break;
        }

        for _ in 0..BATCH {
            // Advance scalar
            inc_be(&mut seed);

            let sk = match SecretKey::from_slice(&seed) {
                Ok(s) => s,
                Err(_) => continue, // zero / >= curve order; extremely rare
            };
            let pk = PublicKey::from_secret_key(secp, &sk);
            let addr = address_from_pubkey(&pk);
            let hash = keccak_of_address(&addr);

            if has_prefix(&hash, &shared.prefix) {
                let n = shared.found.fetch_add(1, Ordering::SeqCst) + 1;
                print_match(&seed, &addr, &hash);
                if shared.target_count > 0 && n >= shared.target_count {
                    shared.stop.store(true, Ordering::SeqCst);
                    break;
                }
            }
        }

        local_tries += BATCH;
        if local_tries >= BATCH * 16 {
            shared.tried.fetch_add(local_tries, Ordering::Relaxed);
            local_tries = 0;
        }
    }

    if local_tries > 0 {
        shared.tried.fetch_add(local_tries, Ordering::Relaxed);
    }
}

fn print_match(privkey: &[u8; 32], addr: &[u8; 20], hash: &[u8; 32]) {
    // Emit a clearly delimited single-line record per match so output is easy
    // to grep/pipe. Fields: priv, addr, keccak(addr).
    println!(
        "MATCH priv=0x{} addr=0x{} keccak_addr=0x{}",
        hex::encode(privkey),
        hex::encode(addr),
        hex::encode(hash)
    );
}

fn main() {
    let cli = Cli::parse();
    let prefix = parse_prefix(&cli.prefix);

    let threads = if cli.threads == 0 {
        num_cpus_rayon_default()
    } else {
        cli.threads
    };
    rayon::ThreadPoolBuilder::new()
        .num_threads(threads)
        .build_global()
        .expect("failed to build rayon thread pool");

    if cli.bench > 0 {
        run_bench(cli.bench, threads);
        return;
    }

    eprintln!(
        "miner: threads={} prefix=0x{} ({} bytes) target_matches={}",
        threads,
        hex::encode(&prefix),
        prefix.len(),
        cli.count
    );
    eprintln!(
        "expected tries per match ~ 2^{}",
        prefix.len() * 8
    );

    let shared = Arc::new(Shared {
        stop: AtomicBool::new(false),
        tried: AtomicU64::new(0),
        found: AtomicU64::new(0),
        prefix,
        target_count: cli.count,
    });

    {
        let s = shared.clone();
        ctrlc::set_handler(move || {
            eprintln!("\ninterrupt received, stopping...");
            s.stop.store(true, Ordering::SeqCst);
        })
        .ok();
    }

    // Progress reporter
    let reporter_shared = shared.clone();
    let report_interval = cli.report_interval.max(1);
    let reporter = std::thread::spawn(move || {
        let start = Instant::now();
        let mut last = 0u64;
        let mut last_instant = start;
        while !reporter_shared.stop.load(Ordering::Relaxed) {
            std::thread::sleep(Duration::from_secs(report_interval));
            if reporter_shared.stop.load(Ordering::Relaxed) {
                break;
            }
            let now = Instant::now();
            let tried = reporter_shared.tried.load(Ordering::Relaxed);
            let delta = tried.saturating_sub(last);
            let dt = now.duration_since(last_instant).as_secs_f64().max(1e-6);
            let rate = delta as f64 / dt;
            let total_dt = now.duration_since(start).as_secs_f64().max(1e-6);
            let avg = tried as f64 / total_dt;
            eprintln!(
                "progress: tried={} ({:.0}/s now, {:.0}/s avg) found={} elapsed={:.1}s",
                tried,
                rate,
                avg,
                reporter_shared.found.load(Ordering::Relaxed),
                total_dt
            );
            last = tried;
            last_instant = now;
        }
    });

    (0..threads).into_par_iter().for_each(|_| {
        let secp = Secp256k1::new();
        worker_loop(&shared, &secp);
    });

    shared.stop.store(true, Ordering::SeqCst);
    let _ = reporter.join();

    eprintln!(
        "done. tried={} found={}",
        shared.tried.load(Ordering::Relaxed),
        shared.found.load(Ordering::Relaxed)
    );
}

fn num_cpus_rayon_default() -> usize {
    std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(1)
}

fn run_bench(seconds: u64, threads: usize) {
    eprintln!("benchmark: {} threads for {}s", threads, seconds);
    let stop = Arc::new(AtomicBool::new(false));
    let tried = Arc::new(AtomicU64::new(0));
    let start = Instant::now();

    let stop_clone = stop.clone();
    std::thread::spawn(move || {
        std::thread::sleep(Duration::from_secs(seconds));
        stop_clone.store(true, Ordering::SeqCst);
    });

    (0..threads).into_par_iter().for_each(|_| {
        let secp = Secp256k1::new();
        let mut seed = [0u8; 32];
        OsRng.fill_bytes(&mut seed);
        let mut local: u64 = 0;
        while !stop.load(Ordering::Relaxed) {
            for _ in 0..2048 {
                inc_be(&mut seed);
                if let Ok(sk) = SecretKey::from_slice(&seed) {
                    let pk = PublicKey::from_secret_key(&secp, &sk);
                    let addr = address_from_pubkey(&pk);
                    let _hash = keccak_of_address(&addr);
                }
            }
            local += 2048;
            if local >= 2048 * 8 {
                tried.fetch_add(local, Ordering::Relaxed);
                local = 0;
            }
        }
        tried.fetch_add(local, Ordering::Relaxed);
    });

    let elapsed = start.elapsed().as_secs_f64();
    let n = tried.load(Ordering::Relaxed);
    eprintln!(
        "bench: tried={} in {:.2}s => {:.0} addr/s ({:.0} addr/s/thread)",
        n,
        elapsed,
        n as f64 / elapsed,
        (n as f64 / elapsed) / threads as f64
    );
}

// --- basic tests ---

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn known_address_from_privkey() {
        // Test vector: a well-known privkey -> address mapping.
        // priv = 0x0000...0001 -> address 0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf
        let mut sk_bytes = [0u8; 32];
        sk_bytes[31] = 1;
        let secp = Secp256k1::new();
        let sk = SecretKey::from_slice(&sk_bytes).unwrap();
        let pk = PublicKey::from_secret_key(&secp, &sk);
        let addr = address_from_pubkey(&pk);
        assert_eq!(
            hex::encode(addr),
            "7e5f4552091a69125d5dfcb7b8c2659029395bdf"
        );
    }

    #[test]
    fn keccak_empty() {
        let h = {
            let mut k = Keccak::v256();
            k.update(b"");
            let mut o = [0u8; 32];
            k.finalize(&mut o);
            o
        };
        assert_eq!(
            hex::encode(h),
            "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
        );
    }

    #[test]
    fn inc_be_basic() {
        let mut b = [0u8; 32];
        b[31] = 0xff;
        inc_be(&mut b);
        assert_eq!(b[31], 0x00);
        assert_eq!(b[30], 0x01);
    }

    #[test]
    fn prefix_match() {
        let mut h = [0u8; 32];
        h[0] = 0x00;
        h[1] = 0x00;
        h[2] = 0x12;
        assert!(has_prefix(&h, &[0x00, 0x00]));
        assert!(!has_prefix(&h, &[0x00, 0x00, 0x00]));
    }

    #[test]
    fn parse_prefix_ok() {
        assert_eq!(parse_prefix("0x00000000"), vec![0, 0, 0, 0]);
        assert_eq!(parse_prefix("deadbeef"), vec![0xde, 0xad, 0xbe, 0xef]);
        assert_eq!(parse_prefix(""), Vec::<u8>::new());
    }
}
