"use client";

import { Card } from "@/components/ui/card";
import { handleOperation } from "@/lib/cryptoUtils";
import { cleanDate, copyToClipboard, delay } from "@/lib/helpers";
import { Check, Copy, ExternalLink, EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PasswordDialog } from "./passwordDialog";
import { Skeleton } from "./ui/skeleton";
import { PasswordFormData } from "@/lib/schemas";

interface PasswordCardProps {
  user_id: string;
  time_created: string;
  cipher: string;
  title: string;
  service_url: string;
  service_description: string;
  password_id: number;
  password: string;
  loadPasswords: () => Promise<void>;
  onSubmit: (
    data: PasswordFormData,
    isEditing: boolean,
    password_id?: number
  ) => void;
}

export default function PasswordCard({
  user_id,
  time_created,
  cipher,
  title,
  service_url,
  service_description,
  password_id,
  password,
  loadPasswords,
  onSubmit,
}: PasswordCardProps) {
  const [hidden, setHidden] = useState<boolean>(true);
  const [servicePassword, setServicePassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);


  const clipboardAnimation = async () => {
    setShowAnimation(true);
    await delay(1000);
    setShowAnimation(false);
  };

  const initialData = {
    password: servicePassword || cipher,
    url: service_url || undefined,
    description: service_description || "",
    time_created,
    title,
    user_id,
    password_id,
  };

  useEffect(() => {
    const getPassword = async () => {
      const p: string | undefined = await handleOperation(
        "decrypt",
        cipher,
        password
      );
      p ? setServicePassword(p) : setServicePassword("Error");
      setLoading(false);
    };

    getPassword();
  }, [
    cipher,
    password,
    initialData.description,
    initialData.password,
    initialData.title,
    initialData.url,
  ]);

  return (
    <>
      <Card
        data-user={`${user_id} ${password_id}`}
        className="w-full max-w-3xl p-4 relative"
      >
        {service_url && (
          <Link href={service_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-5 w-5 absolute top-2 right-2" />
          </Link>
        )}
        <div className="w-full flex items-start justify-between gap-4">
          {!loading ? (
            <PasswordDialog
              loadPasswords={loadPasswords}
              initialData={initialData}
              onSubmit={onSubmit}
              trigger={
                <div className="cursor-pointer flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {service_description === ""
                      ? "No description provided."
                      : service_description}
                  </p>
                </div>
              }
            />
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <Skeleton className="w-[300px] h-[20px] p-4 bg-[#7a7a7a3f]" />
                <Skeleton className="w-[200px] h-[20px] p-4 bg-[#7a7a7a3f]" />
              </div>
            </>
          )}

          <div className="w-full max-w-48 flex flex-col-reverse items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Copy
                size={24}
                onClick={() => {
                  copyToClipboard(servicePassword);
                  clipboardAnimation();
                }}
                className={`stroke-black h-4 w-4 cursor-pointer
          ${showAnimation || !servicePassword ? "hidden" : "block"}
          hover:stroke-[3]
          transition-all duration-500
            `}
              />
              <Check
                size={24}
                className={`stroke-green-400 stroke-[3] h-4 w-4 cursor-pointer
          hover:stroke-[3]
          transition-all duration-500 ${showAnimation ? "block" : "hidden"}
          `}
              />

              {hidden ? (
                <EyeIcon
                  className="h-4 w-4 cursor-pointer hover:stroke-[3] transition-all duration-300"
                  onClick={() => setHidden(!hidden)}
                />
              ) : (
                <EyeOffIcon
                  className="h-4 w-4 cursor-pointer hover:stroke-[3] transition-all duration-300"
                  onClick={() => setHidden(!hidden)}
                />
              )}

              <span className="text-lg text-center">
                {hidden ? "•••••••••••••" : servicePassword}
              </span>
            </div>
            <div className="flex items-center gap-1 text-base">
              <time dateTime={time_created}>{cleanDate(time_created)}</time>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
