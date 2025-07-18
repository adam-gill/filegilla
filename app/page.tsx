import Navbar from "@/components/navbar";
import { getUserData } from "@/lib/auth/userData";

export default async function Home() {

  const userData = await getUserData();

  return (
    <>
      <Navbar />

      <div className="flex flex-col min-h-screen w-full px-8 mx-auto max-w-7xl">
        <div>Account Info:</div>
        {userData && (
          <div>
            <div>Name: {userData.name}</div>
            <div>Email: {userData.email}</div>
            <div>Username: {userData.username}</div>
          </div>
        )}


      </div>
    </>
  );
}