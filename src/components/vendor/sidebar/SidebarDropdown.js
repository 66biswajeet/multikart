import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

function SidebarDropdown({ item, isActiveParent, idx }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(isActiveParent);
  React.useEffect(() => {
    if (isActiveParent) setOpen(true);
  }, [isActiveParent]);
  return (
    <li className="sidebar-list">
      <div
        className={`sidebar-link sidebar-title${
          isActiveParent || open ? " active" : ""
        }`}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: "5px 15px",
          margin: "0 3px",
          fontWeight: 500,
          color: "inherit",
          opacity: 1,
          userSelect: "none",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {item.icon}
          <span>{item.title}</span>
        </span>
        <span style={{ marginLeft: "auto", fontSize: 12, paddingLeft: 8 }}>
          {open || isActiveParent ? "▲" : "▼"}
        </span>
      </div>
      <ul
        className={`sidebar-submenu${
          open || isActiveParent ? " d-block" : " d-none"
        }`}
        style={{
          position: "static",
          background: "none",
          boxShadow: "none",
          padding: 0,
        }}
      >
        {item.children.map((child) => (
          <li key={child.path}>
            <Link
              href={child.path}
              className={pathname === child.path ? "active" : ""}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 30px",
                color:
                  pathname === child.path ? "var(--theme-color)" : "inherit",
                fontWeight: 500,
                background: "none",
              }}
            >
              {child.icon}
              <span style={{ marginLeft: 8 }}>{child.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default SidebarDropdown;
