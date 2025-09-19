import { ReactNode } from "react";
import clsx from "clsx";

interface MaxWidthWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function MaxWidthWrapper({
  children,
  className,
}: MaxWidthWrapperProps) {
  return (
    <div
      className={clsx(
        "mx-auto w-full max-w-screen-sm px-4", // mobile first, centered
        className
      )}>
      {children}
    </div>
  );
}
