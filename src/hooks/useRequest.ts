import { useEffect, useState } from "react";
import { decodeCBOR } from "../cbor";

async function getRequest() {
  const res = await fetch("https://cashu402.fly.dev/image");
  if (!res.ok) {
    if (res.status === 402) {
      const header = res.headers.get("X-Cashu");
      if (!header || !header.startsWith("creq")) {
        throw new Error("Invalid headers");
      }
      const base64Req = header.slice(5);
      const cbor = Uint8Array.from(atob(base64Req), (c) => c.charCodeAt(0));

      const request = decodeCBOR(cbor) as {
        a: number;
        u: string;
        m: string[];
      };
      return { amount: request.a, mint: request.m[0] };
    }
  }
}

export const useRequest = () => {
  const [request, setRequest] = useState<{ amount: number; mint: string }>();
  useEffect(() => {
    async function setup() {
      const request = await getRequest();
      setRequest(request);
    }
    setup();
  }, []);
  return request;
};
