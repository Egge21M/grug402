import {
  CashuMint,
  CashuWallet,
  getEncodedToken,
  type MintQuoteResponse,
} from "@cashu/cashu-ts";
import { useState } from "react";
type UseLightningReturn = [
  Awaited<ReturnType<CashuWallet["createMintQuote"]>> | undefined,
  () => Promise<void>,
  string | undefined,
];

export const useLightning = (request?: {
  amount: number;
  mint: string;
}): UseLightningReturn => {
  const [quote, setQuote] =
    useState<Awaited<ReturnType<CashuWallet["createMintQuote"]>>>();
  const [token, setToken] = useState<string>();

  async function getQuote() {
    if (!request) {
      return;
    }
    const wallet = new CashuWallet(new CashuMint(request.mint));
    const quote = await wallet.createMintQuote(request.amount);
    setQuote(quote);
    await wallet.onMintQuotePaid(
      quote.quote,
      () => {
        redeemQuote(request.amount, quote, request.mint);
      },
      (e) => {
        console.error(e);
      },
    );
  }
  async function redeemQuote(
    amount: number,
    quote: MintQuoteResponse,
    mintUrl: string,
  ) {
    console.log("Redeeming");
    const wallet = new CashuWallet(new CashuMint(mintUrl));
    const proofs = await wallet.mintProofs(amount, quote.quote);
    console.log(proofs);
    setToken(getEncodedToken({ proofs, mint: mintUrl }));
  }
  return [quote, getQuote, token];
};
