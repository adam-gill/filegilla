"use client";

import { useAuth } from "@/lib/useAuth";
import axios from "axios";
import { useEffect } from "react";

const Passwords = () => {
  const { session } = useAuth();

  const fetchPasswords = async () => {
    const passwords = await axios.get("/api/getPasswords", {
      params: { userId: session?.user.id },
    });

    console.log(passwords);
  };

  useEffect(() => {
    if (session?.user.id) {
      fetchPasswords();
    }
  }, []);

  return (
    <>
      <div className="w-full py-10">
        <div className="w-full max-w-6xl px-6 mx-auto">Passwords</div>
      </div>
    </>
  );
};

export default Passwords;
