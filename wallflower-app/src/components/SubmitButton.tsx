"use client";

import { useFormStatus } from "react-dom";
import Spinner from "@/components/Spinner";

export default function SubmitButton({
  children,
  pendingLabel,
  className,
  style,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingLabel?: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      style={{ ...style, opacity: pending ? 0.75 : (style?.opacity ?? 1), cursor: pending ? "default" : style?.cursor }}
      {...rest}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-1.5">
          <Spinner size={14} />
          {pendingLabel ?? children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
