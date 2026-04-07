"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/create", label: "Create", Icon: IconCreate },
  { href: "/preview", label: "Preview", Icon: IconPreview },
  { href: "/saved", label: "Saved", Icon: IconSaved },
] as const;

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="topNav" role="navigation" aria-label="Main">
      {items.map(({ href, label, Icon }) => {
        const isActive = pathname === href;
        return (
          <Link key={href} href={href} className={`topNavItem${isActive ? " topNavItemActive" : ""}`}>
            <Icon />
            <span>{label}</span>
          </Link>
        );
      })}
    </header>
  );
}

function IconCreate() {
  return (
    <svg className="topNavIcon" viewBox="0 0 24 24" aria-hidden>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconPreview() {
  return (
    <svg className="topNavIcon" viewBox="0 0 24 24" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconSaved() {
  return (
    <svg className="topNavIcon" viewBox="0 0 24 24" aria-hidden>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}
