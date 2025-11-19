"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  RiDashboardLine,
  RiStoreLine,
  RiShoppingBagLine,
  RiWalletLine,
  RiBarChartLine,
  RiCustomerServiceLine,
  RiUserSettingsLine,
  RiUserLine, // <-- 1. ICON IS IMPORTED
} from "react-icons/ri";

const VendorSidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Dashboard",
      path: "/vendor/dashboard",
      icon: <RiDashboardLine />,
    },
    { title: "Profile", path: "/vendor/profile", icon: <RiUserSettingsLine /> },
    { title: "Warehouses", path: "/vendor/warehouses", icon: <RiStoreLine /> },
    {
      title: "Products",
      path: "/vendor/products",
      icon: <RiShoppingBagLine />,
    },
    { title: "Orders", path: "/vendor/orders", icon: <RiShoppingBagLine /> },
    { title: "Payout", path: "/vendor/payout", icon: <RiWalletLine /> },
    { title: "Reports", path: "/vendor/reports", icon: <RiBarChartLine /> },
    {
      title: "Support",
      path: "/vendor/support",
      icon: <RiCustomerServiceLine />,
    },
  ];

  // --- 2. DEFINE THE ACCOUNT LINK ---
  const accountLink = {
    title: "My Account",
    path: "/account", // Link back to the personal profile
    icon: <RiUserLine />,
  };
  // ---------------------------------

  return (
    <div className="sidebar-wrapper">
      <nav className="sidebar-main">
        <div id="sidebar-menu">
          <ul className="sidebar-links">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={pathname === item.path ? "active" : ""}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}

            {/* --- 3. ADD SEPARATOR AND LINK --- */}
            <li className="sidebar-list">
              <hr className="mt-3 mb-2" />
            </li>
            <li>
              <Link
                href={accountLink.path}
                className={pathname === accountLink.path ? "active" : ""}
              >
                {accountLink.icon}
                <span>{accountLink.title}</span>
              </Link>
            </li>
            {/* --- END OF ADDITION --- */}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default VendorSidebar;
