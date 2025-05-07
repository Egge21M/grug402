import { createPortal } from "react-dom";
import { useStopScroll } from "../hooks/useStopScroll";
import type { ReactNode } from "react";

type ModalProps = {
  children: ReactNode;
};

function ModalContent({ children }: ModalProps) {
  useStopScroll();

  return (
    <>
      <div className="inset-0 bg-black opacity-80 fixed " />
      <div className="fixed inset-0 w-full flex justify-center items-center">
        <div className="max-w-screen-sm flex flex-col items-center gap-8 text-white text-center bg-neutral-800 rounded-xl p-4">
          {children}
        </div>
      </div>
    </>
  );
}

function Modal({ children }: ModalProps) {
  return createPortal(
    <ModalContent>{children}</ModalContent>,
    document.getElementById("modal")!,
  );
}

export default Modal;
