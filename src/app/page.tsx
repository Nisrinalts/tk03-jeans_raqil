'use client'; 

import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Home() {
  const router = useRouter();
  const user = getUser();
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <Navbar role={user?.role || "guest"} />
      <div className="text-center justify-center items-center flex flex-col gap-4 mt-20 bg-white p-10 rounded-lg shadow-lg mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 justify-center text-center items-center">Selamat Datang di Sistem Manajemen Event</h1>
        <p className="text-lg text-gray-600">Silakan login untuk mengelola event dan tiket Anda.</p>
      </div>
    </main>
  );
}