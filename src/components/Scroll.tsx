import type { ReactNode } from "react";

/** Conteúdo scrollável dentro do app, com padding-bottom para não cobrir a TabBar. */
export function Scroll({
  children,
  className = "",
  withTabBar = true,
}: {
  children: ReactNode;
  className?: string;
  withTabBar?: boolean;
}) {
  return (
    <div
      className={
        "flex-1 overflow-y-auto overflow-x-hidden " +
        (withTabBar ? "pb-[calc(var(--tabbar-h)+24px)] " : "pb-6 ") +
        className
      }
    >
      {children}
    </div>
  );
}
