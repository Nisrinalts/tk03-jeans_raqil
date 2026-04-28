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
    { label: "Beranda", href: "/" },
    { label: "Login", href: "/login" },
    { label: "Registrasi", href: "/register" },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Manajemen Venue", href: "/venues" },
    { label: "Manajemen Tiket", href: "/tickets" },
    { label: "Manajemen Artist", href: "/artists" },
    { label: "Manajemen Kursi", href: "/seats" },
    { label: "Kategori Tiket", href: "/ticket-categories" },
    { label: "Tiket", href: "/assets/tickets" },
    { label: "Order", href: "/order" },
    { label: "Promotions", href: "/promotion" },
    { label: "Profile", href: "/profile" },
  ],
  organizer: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Event Saya", href: "/events" },
    { label: "Manajemen Venue", href: "/venues" },
    { label: "Manajemen Kursi", href: "/seats" },
    { label: "Kategori Tiket", href: "/ticket-categories" },
    { label: "Manajemen Tiket", href: "/tickets" },
    { label: "Artist", href: "/artists" },
    { label: "Tiket", href: "/assets/tickets" },
    { label: "Order", href: "/order" },
    { label: "Promotions", href: "/promotion" },
    { label: "Profile", href: "/profile" },
  ],
  customer: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Tiket Saya", href: "/my-tickets" },
    { label: "Pesanan", href: "/order" },
    { label: "Cari Event", href: "/events" },
    { label: "Promosi", href: "/promotion" },
    { label: "Venue", href: "/venues" },
    { label: "Artis", href: "/artists" },
    { label: "Kategori Tiket", href: "/ticket-categories" },
    { label: "Profile", href: "/profile" },
    { label: "Logout", href: "/logout" },
  ],
};

export default function Navbar({ role }: NavbarProps) {
  const router = useRouter();
  const menus = menuByRole[role];

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
        <Link
          href="/"
          className="shrink-0 text-lg font-bold tracking-tight text-gray-900"
        >
          TikTakTuk
        </Link>

        <nav className="flex flex-1 items-center justify-end gap-1 overflow-x-auto whitespace-nowrap">
          {menus.map((menu) =>
            menu.href === "/logout" ? (
              <button
                key="logout"
                onClick={handleLogout}
                className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
              >
                {menu.label}
              </button>
            ) : (
              <Link
                key={menu.label}
                href={menu.href}
                className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-black"
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