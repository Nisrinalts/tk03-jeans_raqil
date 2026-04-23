"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

type Role = "guest" | "admin" | "organizer" | "customer";

type MenuItem = {
  label: string;
  href: string;
};

type NavbarProps = {
  role: Role;
};

const menuByRole: Record<Role, MenuItem[]> = {
  guest: [
    { label: "Login", href: "/login" },
    { label: "Registrasi", href: "/register" },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Manajemen Venue", href: "/venues" },
    { label: "Manajemen Event", href: "/events" },
    { label: "Manajemen Kursi", href: "/seats/manage" },
    { label: "Kategori Tiket", href: "/ticket-categories/manage" },
    { label: "Manajemen Tiket", href: "/tickets/manage" },
    { label: "Semua Order", href: "/orders/all" },
    { label: "Tiket (Aset)", href: "/assets/tickets" },
    { label: "Order (Aset)", href: "/assets/orders" },
    { label: "Profile", href: "/profile" },
    { label: "Logout", href: "/logout" },
  ],
  organizer: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Event Saya", href: "/events" },
    { label: "Manajemen Venue", href: "/venues" },
    { label: "Manajemen Kursi", href: "/seats/manage" },
    { label: "Kategori Tiket", href: "/ticket-categories/manage" },
    { label: "Manajemen Tiket", href: "/tickets/manage" },
    { label: "Semua Order", href: "/orders/all" },
    { label: "Tiket (Aset)", href: "/assets/tickets" },
    { label: "Order (Aset)", href: "/assets/orders" },
    { label: "Profile", href: "/profile" },
    { label: "Logout", href: "/logout" },
  ],
  customer: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Tiket Saya", href: "/my-tickets" },
    { label: "Pesanan", href: "/orders" },
    { label: "Cari Event", href: "/events" },
    { label: "Promosi", href: "/promotions" },
    { label: "Venue", href: "/venues" },
    { label: "Artis", href: "/artists" },
    { label: "Logout", href: "/logout" },
  ],
};

export default function Navbar({ role }: NavbarProps) {
  const router = useRouter();
  const menus = menuByRole[role];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
          JEANS RAQIL
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2">
          {menus.map((menu) =>
            menu.href === "/logout" ? (
              <button
                key="logout"
                onClick={handleLogout}
                className="rounded-full px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
              >
                {menu.label}
              </button>
            ) : (
              <Link
                key={menu.label}
                href={menu.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-black"
              >
                {menu.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
