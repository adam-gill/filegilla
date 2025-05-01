"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface ApiResponse {
    success: string;
    message: string;
    timestamp: string;
}

const Test = () => {
  const [body, setBody] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [response, setResponse] = useState<ApiResponse>();
  const router = useRouter();

  const onSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/time", { message: body });
      setResponse(response.data);
    } catch (error: any) {
      setError(error.response.data)
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <>
      <div className="w-full h-screen px-8">
        <h1 className="text-4xl mb-4 text-center">{"Test API's"}</h1>

        <div className="w-1/3">
          <h1 className="mb-2">Time API - /time</h1>
          <Input
            placeholder="Body"
            className="mb-2"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          ></Input>
          <Button onClick={() => onSubmit()}>Send Request</Button>
          <h1 className="mt-2">
            {loading ? "Loading..." : "Result: " + response?.message}
          </h1>
          <h1 onClick={() => setError("")}>{error && "Error: " + error}</h1>
        </div>
      </div>
    </>
  );
};

export default Test;