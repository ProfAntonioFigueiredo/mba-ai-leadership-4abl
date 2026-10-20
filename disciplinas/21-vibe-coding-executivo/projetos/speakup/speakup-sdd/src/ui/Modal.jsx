import React, { useEffect, useRef } from "react";
export function Modal({ label, onClose, pending, children }) {
  const dialog = useRef(null),
    close = useRef(onClose),
    busy = useRef(pending);
  close.current = onClose;
  busy.current = pending;
  useEffect(() => {
    const previous = document.activeElement;
    const node = dialog.current;
    node.showModal();
    const cancel = (event) => {
      event.preventDefault();
      if (!busy.current) close.current();
    };
    node.addEventListener("cancel", cancel);
    return () => {
      node.removeEventListener("cancel", cancel);
      node.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="dialog"
      aria-label={label}
      onClick={(event) => {
        if (event.target === dialog.current && !pending) {
          const box = dialog.current.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            onClose();
        }
      }}
    >
      {children}
    </dialog>
  );
}
