import { NextResponse } from "next/server";

const TOKEN_MINT = "H6KgtksNwiEe3bBpAcXFcC7za3d3V9Y4inayFyCPyy4j";

export async function GET() {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${TOKEN_MINT}`
    );
    const data = await res.json();
    const pair = data.pairs?.[0];

    const marketCap = pair?.marketCap ?? pair?.fdv ?? 0;
    const priceUsd = pair ? parseFloat(pair.priceUsd) : 0;

    return NextResponse.json({ marketCap, priceUsd });
  } catch {
    return NextResponse.json({ marketCap: 0, priceUsd: 0 }, { status: 500 });
  }
}
