import { FaBolt, FaLock } from "react-icons/fa6";
import { TbBrandPeanut } from "react-icons/tb";
import { useRequest } from "./hooks/useRequest";
import Modal from "./components/Modal";
import { useLightning } from "./hooks/useLightning";
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";
import { useCashu } from "./hooks/useCashu";
import mermaid from "mermaid";

function App() {
  const request = useRequest();
  const [quote, getQuote, lightningToken] = useLightning(request);
  const [creq, createCreq, cashuToken] = useCashu(request);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    mermaid.initialize({ theme: "dark" });
    mermaid.contentLoaded();
  });

  useEffect(() => {
    async function getImage() {
      if (lightningToken) {
        const res = await fetch("https://cashu402.fly.dev/image", {
          headers: {
            "X-Cashu": lightningToken,
          },
        });
        const buffer = await res.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            "",
          ),
        );
        setImageUrl(`data:image/png;base64,${base64}`);
      }
      if (cashuToken) {
        const res = await fetch("https://cashu402.fly.dev/image", {
          headers: {
            "X-Cashu": cashuToken,
          },
        });
        const buffer = await res.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            "",
          ),
        );
        setImageUrl(`data:image/png;base64,${base64}`);
      }
    }
    if (lightningToken || cashuToken) {
      getImage();
    }
  }, [lightningToken, cashuToken]);
  return (
    <main className="flex flex-col gap-4 items-center max-w-5xl w-full">
      <h1>Hot Memes For Sale!</h1>
      <div className="h-96 w-96 bg-neutral-700 rounded flex items-center justify-center">
        {imageUrl ? <img src={imageUrl} /> : <FaLock className="text-5xl" />}
      </div>
      {request && !imageUrl ? (
        <div className="flex flex-col items-center gap-2">
          <div>
            <p>Pay {request.amount} Sats to see the meme!</p>
          </div>
          <div className="flex gap-4">
            <button
              className="flex gap-2 items-center bg-purple-800"
              onClick={createCreq}
            >
              <TbBrandPeanut />
              Pay with Nuts
            </button>

            <button
              className="flex gap-2 items-center bg-yellow-600"
              onClick={getQuote}
            >
              <FaBolt />
              Pay with Bolts
            </button>
          </div>
        </div>
      ) : undefined}
      {quote && !lightningToken ? (
        <Modal>
          <p>Please pay this invoice</p>
          <div className="p-2 bg-white rounded">
            <QRCode value={quote.request} />
          </div>
        </Modal>
      ) : undefined}
      {creq && !cashuToken ? (
        <Modal>
          <p>Please pay this Cashu Payment Request</p>
          <div className="p-2 bg-white rounded">
            <QRCode value={creq} />
          </div>
          <p className="max-w-full text-xs wrap-anywhere">{creq}</p>
        </Modal>
      ) : undefined}
      <hr className="w-full my-8" />
      <div className="flex flex-col gap-1 text-justify">
        <h2 className="text-2xl font-bold my-4  ">How does this work?</h2>
        <p>
          The little Proof Of Concept you see above was built using Cashu 402, a
          protocol for internet payments.
        </p>
        <p>
          Cashu 402 uses the long-forgotten HTTP status quote 402 (Payment
          Required). With it servers can communicate that a certain resource is
          protected and needs to be paid. Clients can then add a Cashu token to
          their request (using the X-Cashu header) to pay for it.
        </p>
        <pre className="mermaid flex flex-col w-full items-center text-center mt-8">
          {`
sequenceDiagram
    Client->>Server: Request resource
    Server->>Client: Status: 402 + CREQ in header
    Note over Client: Parse CREQ & creates token
    Client->>Server: Request resource (with token in header)
    Server->>Client: Status: 200 + resource
`}
        </pre>
      </div>
    </main>
  );
}

export default App;
