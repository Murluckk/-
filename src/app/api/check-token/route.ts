import { NextRequest, NextResponse } from "next/server";

const TOKEN_MINT = "9zHs8yjDLVyn81boYdehnFvE1kvCoC2MQwzg7LXUpump";
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";
const ELIGIBLE_USD = 10;

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json();

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        { error: "Missing walletAddress" },
        { status: 400 }
      );
    }

    // Get token accounts for this wallet + mint
    const rpcRes = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [
          walletAddress,
          { mint: TOKEN_MINT },
          { encoding: "jsonParsed" },
        ],
      }),
    });

    const rpcData = await rpcRes.json();

    if (rpcData.error) {
      return NextResponse.json(
        { error: rpcData.error.message ?? "RPC error" },
        { status: 400 }
      );
    }

    const accounts = rpcData.result?.value ?? [];
    let rawBalance = 0;
    let decimals = 6;

    for (const acct of accounts) {
      const info = acct.account?.data?.parsed?.info;
      if (info) {
        rawBalance += Number(info.tokenAmount?.amount ?? 0);
        decimals = info.tokenAmount?.decimals ?? 6;
      }
    }

    const balance = rawBalance / 10 ** decimals;

    // Get USD price from DexScreener
    const dexRes = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${TOKEN_MINT}`
    );
    const dexData = await dexRes.json();

    const pair = dexData.pairs?.[0];
    const priceUsd = pair ? parseFloat(pair.priceUsd) : 0;
    const valueUsd = balance * priceUsd;
    const eligible = valueUsd >= ELIGIBLE_USD;

    return NextResponse.json({ balance, priceUsd, valueUsd, eligible });
  } catch (err) {
    console.error("check-token error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
