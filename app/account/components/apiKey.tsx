"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth/auth-client";
import {
  Copy,
  KeyRound,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  createApiKey,
  deleteApiKey,
  getApiKeys,
} from "../actions";
import CopyText from "@/app/u/components/copyText";

type ApiKeyMeta = { id: string; name: string | null };

export default function ApiKey() {
  const { data: session, isPending } = authClient.useSession();

  const [keys, setKeys] = useState<ApiKeyMeta[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Newly created key — plaintext visible only here, until the user
  // closes it or navigates away.
  const [revealedKey, setRevealedKey] = useState<{
    id: string;
    name: string;
    key: string;
  } | null>(null);

  const [name, setName] = useState<string>("");
  const [nameError, setNameError] = useState<string | undefined>(undefined);

  // Two-click delete confirmation: click once to arm, again within 3s.
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      setIsFetching(false);
      return;
    }
    void refreshKeys();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!confirmingId) return;
    const t = setTimeout(() => setConfirmingId(null), 3000);
    return () => clearTimeout(t);
  }, [confirmingId]);

  const refreshKeys = async () => {
    setIsFetching(true);
    const res = await getApiKeys();
    setIsFetching(false);
    if (!res.success) {
      toast({
        title: "error fetching api keys",
        description: res.message,
        variant: "destructive",
      });
      return;
    }
    setKeys(res.apiKeysMetadata ?? []);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      setNameError("name is required");
    } else if (trimmed.length > 64) {
      setNameError("name must be 64 characters or less");
    } else {
      setNameError(undefined);
    }
  };

  const handleCreate = async () => {
    if (nameError) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("name is required");
      return;
    }

    setIsCreating(true);

    const res = await createApiKey(trimmedName);

    setIsCreating(false);

    if (!res.success || !res.apiKey || !res.apiKeyId) {
      toast({
        title: "failed to create api key",
        description: res.message,
        variant: "destructive",
      });
      return;
    }

    setRevealedKey({
      id: res.apiKeyId,
      name: trimmedName,
      key: res.apiKey,
    });
    setName("");
    setNameError(undefined);

    toast({
      title: "api key created",
      description: "copy it now — you won't be able to see it again.",
      variant: "good",
    });

    await refreshKeys();
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "copied to clipboard",
        description: "your api key has been copied.",
        variant: "good",
      });
    } catch {
      toast({
        title: "copy failed",
        description: "please copy the key manually.",
        variant: "destructive",
      });
    }
  };

  const handleDismissRevealed = () => {
    setRevealedKey(null);
  };

  const handleDeleteClick = (id: string) => {
    if (confirmingId !== id) {
      setConfirmingId(id);
      return;
    }
    void performDelete(id);
  };

  const performDelete = async (id: string) => {
    setConfirmingId(null);
    setDeletingId(id);
    const res = await deleteApiKey(id);
    setDeletingId(null);

    if (!res.success) {
      toast({
        title: "failed to delete api key",
        description: res.message,
        variant: "destructive",
      });
      return;
    }

    if (revealedKey?.id === id) setRevealedKey(null);

    toast({
      title: "api key deleted",
      description: res.message,
      variant: "good",
    });

    await refreshKeys();
  };

  // --- Render guards -------------------------------------------------------

  if (isPending) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-6 fg-grad border-none min-h-64 flex flex-col justify-between text-black">
        <CardHeader>
          <Skeleton className="h-7 w-40 bg-neutral-700/30!" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full bg-neutral-700/30!" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-32 bg-neutral-700/30!" />
        </CardFooter>
      </Card>
    );
  }

  if (!session?.user) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-6 fg-grad border-none min-h-48 flex flex-col justify-center text-black">
        <CardHeader className="flex flex-row items-center gap-3">
          <KeyRound className="h-6 w-6" />
          <CardTitle className="text-2xl">api keys</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-black">
            sign in to manage your api keys.
          </p>
        </CardContent>
      </Card>
    );
  }

  // --- Authenticated render -------------------------------------------------

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6 fg-grad border-none flex flex-col text-black">
      <CardHeader className="flex flex-row items-center gap-3">
        <KeyRound className="h-6 w-6 text-black m-0" />
        <CardTitle className="text-2xl text-black">api keys</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ----- Create new key ----- */}
        <div className="space-y-3">
          <div>
            <Label
              htmlFor="name"
              className="text-base font-medium text-black"
            >
              key name
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="name"
                type="text"
                placeholder="e.g. my-cli-script"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="bg-transparent text-black"
                maxLength={64}
              />
              <Button
                onClick={handleCreate}
                disabled={isCreating || !!nameError || !name.trim()}
                variant="default"
                className="bg-black text-white hover:bg-black/90"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    creating…
                  </>
                ) : (
                  "create api key"
                )}
              </Button>
            </div>
            {nameError && (
              <p className="text-red-500 text-sm mt-1">{nameError}</p>
            )}
            <p className="text-sm text-black mt-1">
              keys never expire. give each one a unique name so you can revoke them later.
            </p>
          </div>
        </div>

        {/* ----- Revealed plaintext key (one-shot) ----- */}
        {revealedKey && (
          <div className="rounded-md border border-amber-500 bg-amber-100 p-4 space-y-3 text-black">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-700 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900">
                  copy this api key now.
                </p>
                <p className="text-amber-800">
                  you will not be able to view it again after leaving this page.
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-black">
                {revealedKey.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 break-all rounded bg-white border border-amber-300 px-3 py-2 font-mono text-sm select-all">
                  {revealedKey.key}
                </code>
                <CopyText isMinWidth={true} textToCopy={revealedKey.key} />
              </div>
            </div>

            <div className="flex items-center justify-end text-xs text-amber-800">
              <button
                onClick={handleDismissRevealed}
                className="underline hover:no-underline"
              >
                i've saved it, hide
              </button>
            </div>
          </div>
        )}

        {/* ----- Existing keys ----- */}
        <div className="space-y-2">
          <Label className="text-base font-medium text-black">
            your api keys
          </Label>

          {isFetching ? (
            <Skeleton className="h-16 w-full bg-neutral-700/30!" />
          ) : keys.length === 0 ? (
            <p className="text-sm text-black">
              you don't have any api keys yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {keys.map((k) => {
                const isDeleting = deletingId === k.id;
                const isConfirming = confirmingId === k.id;
                return (
                  <li
                    key={k.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-black/10 bg-white/70 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate text-black" title={k.name ?? ""}>
                        {k.name ?? "(unnamed)"}
                      </p>
                      <p
                        className="font-mono text-xs text-black truncate"
                        title={`apiKeyId: ${k.id}`}
                      >
                        apiKeyId: {k.id}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={isConfirming ? "destructive" : "outline"}
                      onClick={() => handleDeleteClick(k.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isConfirming ? (
                        "confirm delete"
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          delete
                        </>
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>

      <CardFooter />
    </Card>
  );
}
