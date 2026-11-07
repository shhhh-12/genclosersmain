import { Rupee } from "./Icons";

/** ₹20,000 with the drawn rupee sign. */
export function Price({ amount, className }: { amount: number; className?: string }) {
  return (
    <span className={className}>
      <span className="sr-only">₹</span>
      <Rupee className="mr-[0.06em] inline-block h-[0.72em] w-auto align-[0.02em]" />
      {amount.toLocaleString("en-IN")}
    </span>
  );
}
