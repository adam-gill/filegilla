"use client";

import { Card } from "@/components/ui/card";
import { handleOperation } from "@/lib/cryptoUtils";
import { cleanDate } from "@/lib/helpers";
import { ExternalLink, EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PasswordDialog } from "./passwordDialog";

interface PasswordCardProps {
  user_id: string;
  time_created: string;
  cipher: string;
  title: string;
  service_url: string;
  service_description: string;
  password_id: number;
  password: string;
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
}: PasswordCardProps) {
  const [hidden, setHidden] = useState<boolean>(true);
  const [servicePassword, setServicePassword] = useState<string | undefined>(
    ""
  );
  
  const initialData = useMemo(() => ({
    password: servicePassword || "",
    url: service_url || "",
    description: service_description || "",
    time_created,
    title,
    user_id,
    password_id,
  }), [servicePassword, service_url, service_description, time_created, title, user_id, password_id]);

  useEffect(() => {
    const getPassword = async () => {
      const p: string | undefined = await handleOperation(
        "decrypt",
        cipher,
        password
      );
      setServicePassword(p ? p : "Error");
    };

    getPassword();
  }, [cipher, password]);

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
          <PasswordDialog
            initialData={initialData}
            onSubmit={() => {}}
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

          <div className="w-full max-w-48 flex flex-col-reverse items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              {hidden ? (
                <EyeIcon
                  className="h-4 w-4 cursor-pointer"
                  onClick={() => setHidden(!hidden)}
                />
              ) : (
                <EyeOffIcon
                  className="h-4 w-4 cursor-pointer"
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
