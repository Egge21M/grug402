import {
  getEncodedToken,
  PaymentRequest,
  PaymentRequestTransportType,
  type Token,
} from "@cashu/cashu-ts";
import {
  generateSecretKey,
  getPublicKey,
  nip19,
  SimplePool,
} from "nostr-tools";
import type { SubCloser } from "nostr-tools/abstract-pool";
import { unwrapEvent } from "nostr-tools/nip17";
import { useEffect, useState } from "react";

const pool = new SimplePool();

export const useCashu = (
  request: { amount: number; mint: string } | undefined,
): [string | undefined, () => void, string] => {
  const [cashuToken, setCashuToken] = useState<string>();
  const [nostrUser, setNostrUser] = useState<{
    sk: Uint8Array;
    pk: string;
    relays: string[];
  }>();
  const [paymentRequest, setPaymentRequest] = useState<string>();
  useEffect(() => {
    let sub: SubCloser;
    if (nostrUser) {
      console.log("Adding sub");
      console.log(nostrUser);
      sub = pool.subscribeMany(
        nostrUser.relays,
        [{ kinds: [1059], "#p": [nostrUser.pk] }],
        {
          onevent: (e) => {
            const rumor = unwrapEvent(e, nostrUser.sk);
            const token: Token = JSON.parse(rumor.content);
            const encodedToken = getEncodedToken(token);
            setCashuToken(encodedToken);
          },
        },
      );
    }
    return () => {
      if (sub) {
        sub.close();
      }
    };
  }, [nostrUser]);
  async function createCreq() {
    if (!request) {
      return;
    }
    const sk = generateSecretKey();
    const pk = getPublicKey(sk);
    setNostrUser({ sk, pk, relays: ["wss://relay.damus.io"] });
    const nprofile = nip19.nprofileEncode({
      relays: ["wss://relay.damus.io"],
      pubkey: pk,
    });
    const pr = new PaymentRequest(
      [
        {
          type: PaymentRequestTransportType.NOSTR,
          target: nprofile,
          tags: [["n", "17"]],
        },
      ],
      undefined,
      request.amount,
      "sat",
      [request.mint],
    ).toEncodedRequest();
    setPaymentRequest(pr);
  }

  return [paymentRequest, createCreq, cashuToken];
};
