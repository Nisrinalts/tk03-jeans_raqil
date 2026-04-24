'use client'

import { useEffect, useState } from "react";
import { getUser, AuthUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ProfilePage () {
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
    const u = getUser();
    if (!u) {
        router.replace("/login");
    } else {
        setUser(prev => prev?.user_id === u.user_id ? prev : u);
    }
    }, [router]);

    if (!user) return null;

    const role = user.role;
    return (
        <main className="min-h-screen bg-gray-100">
            <Navbar role={role!== null ? role : "guest"} />
            <div className="container mx-auto py-8 border-black border-2 background-white">
                <h1>Profile Page</h1>
            </div>
        </main>
    );
}