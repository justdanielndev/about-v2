"use client";

import Link from "next/link";
import type { MouseEventHandler, Ref } from "react";

type TransitionLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  scroll?: boolean;
  linkRef?: Ref<HTMLAnchorElement>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export default function TransitionLink({
  href,
  className,
  children,
  ariaLabel,
  scroll = true,
  linkRef,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onClick
}: TransitionLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      scroll={scroll}
      ref={linkRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
