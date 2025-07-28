"use client";

import { useAuth } from "@/components/auth/auth-wrapper";
import ProtectedRoute from "@/components/auth/protected-route";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen w-full px-8 mx-auto max-w-7xl">
        <div>Account Info:</div>
        <AccountInfo />
      </div>
    </ProtectedRoute>
  );
}
function AccountInfo() {
  const { userData } = useAuth()

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
