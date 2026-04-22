#!/usr/bin/env bash
# Thin wrapper around profanity2 that runs the keccak-of-address mode by
# default. All args are forwarded to profanity2; if --publicKey / -z is not
# supplied, an ERROR is printed.
#
# Examples:
#   ./run.sh --bench
#   ./run.sh --zero-bytes --keccak-address --min 4 --quit-score 4 -z <128 hex>
#
# The binary must be run from the directory that contains profanity.cl and
# keccak.cl, so we cd into it first.

set -euo pipefail
cd "$(dirname "$0")"

if [[ "$#" -eq 0 ]] || [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    cat <<'EOF'
keccak-of-address GPU miner (patched profanity2)

Usage examples:

  # 1. Generate a secret seed keypair locally (NOT inside container!):
  #    docker run --rm <image> python3 /opt/miner/gen-key.py

  # 2. Benchmark hashrate:
  ./run.sh --bench -z <128-hex-public-key>

  # 3. Find an address whose keccak256(address) has >=4 leading zero bytes
  #    and stop as soon as it happens:
  ./run.sh --keccak-address --zero-bytes --quit-score 4 -z <128-hex-public-key>

  # 4. Same, but match any custom byte pattern on keccak256(address):
  #    This matches keccak(addr) starting with "deadbeef":
  ./run.sh --keccak-address --matching deadbeef --quit-score 4 -z <128-hex-public-key>

Key flags (added by this patch):
  -k, --keccak-address   run scoring kernel on keccak256(address) instead of
                         the address bytes themselves
  -Q, --quit-score N     stop the whole miner as soon as a match with
                         score >= N is printed (default 0 = never stop)

Everything else is vanilla profanity2. See --help of profanity2 itself via
./profanity2.x64 -h.

IMPORTANT:
  Final private key = YOUR_SECRET + printed_offset   (mod n)
  The offset printed by profanity2 alone is USELESS without your secret.
  Add them locally with verify.py:
      python3 verify.py <your_secret_hex> <offset_hex>
EOF
    exit 0
fi

exec ./profanity2.x64 --keccak-address "$@"
