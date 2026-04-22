#!/usr/bin/env python3
"""
Generate a secret seed keypair for profanity2.

Prints:
  secret      (32-byte private key, 64 hex chars, NO leading 0x)
  publicKey   (128 hex chars: X || Y, uncompressed without the 0x04 prefix)
  address     (20-byte EOA address for sanity check)

Pass the printed publicKey to profanity2 via `-z`. Keep `secret` OFFLINE.

After profanity2 prints an offset `P` (as the "Private: 0x..." line),
combine:
    final_privkey = (secret + P) mod n
and you're done. Use verify.py for that.

Dependencies: eth-keys, eth-utils  (pulls in coincurve automatically).
    pip install eth-keys eth-utils
"""
from __future__ import annotations

import os
import sys

try:
    from eth_keys import keys
    from eth_utils import keccak
except ImportError as e:  # pragma: no cover
    print(
        "missing deps; run: pip install eth-keys eth-utils",
        file=sys.stderr,
    )
    raise


def main() -> int:
    secret = os.urandom(32)
    pk = keys.PrivateKey(secret)
    pub = pk.public_key.to_bytes()  # 64 bytes, X || Y
    addr = pk.public_key.to_canonical_address()
    kecc = keccak(addr)

    print(f"secret=0x{secret.hex()}")
    print(f"publicKey={pub.hex()}   # pass to profanity2 with -z")
    print(f"address=0x{addr.hex()}")
    print(f"keccak(address)=0x{kecc.hex()}")
    print()
    print("KEEP `secret` SECRET. Do NOT copy it to the GPU box.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
