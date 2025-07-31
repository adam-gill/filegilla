"use client";

import { authClient } from "@/lib/auth/auth-client";

export default function Info() {
    const { data: session } = authClient.useSession();
    const userData = session?.user;

    return (
        <>
            {userData && (
                <div>
                    <div>Name: {userData.name}</div>
                    <div>Email: {userData.email}</div>
                    <div>Username: {userData.username}</div>
                </div>
            )}
        </>
    );
}