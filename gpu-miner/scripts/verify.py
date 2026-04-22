#!/usr/bin/env python3
"""
Combine your local secret with the profanity2-reported offset, derive
the final address, verify that keccak256(address) has the expected prefix.

Usage:
    python3 verify.py <secret_hex> <offset_hex> [expected_prefix_hex]

Example:
    python3 verify.py \\
        3a...ff \\
        18a9...3f \\
        00000000

`expected_prefix_hex` is optional; if given, the script prints OK/FAIL.
"""
from __future__ import annotations

import sys

try:
    from eth_keys import keys
    from eth_utils import keccak
except ImportError:  # pragma: no cover
    print("missing deps; run: pip install eth-keys eth-utils", file=sys.stderr)
    raise

# secp256k1 curve order
N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141


def _hex(s: str) -> int:
    return int(s.removeprefix("0x"), 16)


def main(argv: list[str]) -> int:
    if len(argv) not in (3, 4):
        print(__doc__, file=sys.stderr)
        return 2

    secret = _hex(argv[1])
    offset = _hex(argv[2])
    expected_prefix = argv[3].removeprefix("0x") if len(argv) == 4 else None

    final = (secret + offset) % N
    if final == 0:
        print("final private key is zero, this should never happen", file=sys.stderr)
        return 1

    priv_bytes = final.to_bytes(32, "big")
    pk = keys.PrivateKey(priv_bytes)
    addr = pk.public_key.to_canonical_address()
    kecc = keccak(addr)

    print(f"final_privkey=0x{priv_bytes.hex()}")
    print(f"address=0x{addr.hex()}")
    print(f"keccak(address)=0x{kecc.hex()}")

    if expected_prefix is not None:
        pb = bytes.fromhex(expected_prefix)
        if kecc.startswith(pb):
            print(f"OK: keccak(address) starts with 0x{expected_prefix}")
            return 0
        print(
            f"FAIL: expected prefix 0x{expected_prefix}, got 0x{kecc[: len(pb)].hex()}",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
