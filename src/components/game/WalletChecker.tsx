"use client";

import { useState } from "react";

interface CheckResult {
  balance: number;
  priceUsd: number;
  valueUsd: number;
  eligible: boolean;
}

export default function WalletChecker() {
  const [open, setOpen] = useState(false);
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!wallet.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/check-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: wallet.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Wallet icon button */}
      <button
        onClick={() => setOpen(true)}
        className="bg-[#2d6a4f] border border-[#2d6a4f] rounded-xl px-4 py-2.5 text-white hover:bg-[#1b4332] active:scale-95 transition-all shadow-md flex items-center gap-2"
        title="Check wallet"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
        <span className="font-mono font-bold text-sm">CHECK</span>
      </button>

      {/* Modal backdrop + popup */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-[90vw] max-w-sm p-5 mx-4 font-mono">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1b4332]">
                Token Checker
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Input */}
            <input
              type="text"
              placeholder="Solana wallet address..."
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              className="w-full border border-[#2d6a4f]/30 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2d6a4f] transition-colors"
            />

            {/* Check button */}
            <button
              onClick={handleCheck}
              disabled={loading || !wallet.trim()}
              className="w-full mt-3 bg-[#2d6a4f] text-white rounded-xl py-2.5 text-sm font-bold hover:bg-[#1b4332] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Checking..." : "Check"}
            </button>

            {/* Error */}
            {error && (
              <p className="mt-3 text-xs text-red-500 text-center">{error}</p>
            )}

            {/* Result */}
            {result && (
              <div className="mt-4 p-3 rounded-xl bg-[#eef5f0] border border-[#2d6a4f]/20">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    Balance:{" "}
                    <span className="text-gray-800 font-bold">
                      {result.balance.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </p>
                  <p>
                    Value:{" "}
                    <span className="text-gray-800 font-bold">
                      ${result.valueUsd.toFixed(2)}
                    </span>
                  </p>
                </div>

                {result.eligible ? (
                  <div className="mt-3 bg-[#2d6a4f] text-white text-center rounded-lg py-2 px-3 text-sm font-bold">
                    You&apos;re in the contest for 1 SOL!
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-gray-500 text-center">
                    Hold $10+ of 14k token to participate
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
