import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Arrow } from "./Icons";

type Variant = "signal" | "ghost-dark" | "ghost-light";

const base =
  "group relative inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-pill font-display font-semibold tracking-[-0.01em] transition-[background-color,color,transform] duration-200 ease-primary active:scale-[0.98] select-none";

const variants: Record<Variant, string> = {
  signal: "bg-signal text-signal-ink hover:bg-signal-deep",
  "ghost-dark": "border border-ink-line text-paper hover:border-paper",
  "ghost-light": "border border-paper-line text-ink hover:border-ink",
};

const sizes = {
  md: "h-12 px-6 text-[1rem]",
  lg: "h-15 px-8 text-[1.125rem]",
};

type Props = {
  href: string;
  variant?: Variant;
  size?: keyof typeof sizes;
  arrow?: boolean;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "children">;

export function ButtonLink({ href, variant = "signal", size = "md", arrow = true, className = "", children, ...rest }: Props) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      <span>{children}</span>
      {arrow && (
        <span className="inline-flex transition-transform duration-450 ease-primary group-hover:translate-x-1">
          <Arrow />
        </span>
      )}
    </Link>
  );
}

export const buttonClasses = (variant: Variant = "signal", size: keyof typeof sizes = "md") =>
  `${base} ${variants[variant]} ${sizes[size]}`;
