"use client";

import React, { ReactNode, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { showToast } from "@/lib/showToast";
import CopyButton from "./copyBtn";
import { checkShare } from "@/lib/checkShare";

interface AlertDialogComponentProps {
  title: string;
  description: string;
  setOpen: (value: boolean) => void;
  onConfirm: (value?: string) => void; // Modified to accept optional value
  triggerText: ReactNode;
  confirmText?: string;
  cancelText?: string;
  popOver?: boolean;
  type: "share" | "rename" | "delete" | "deleteSM";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  isRename?: boolean; // New prop to determine if it's a rename dialog
  inputProps?: {
    defaultValue?: string;
    placeholder?: string;
  };
  userId?: string;
  etag?: string;
  disabled?: boolean;
}

export function AlertDialogComponent({
  title,
  description,
  onConfirm,
  triggerText,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  type,
  popOver,
  isRename,
  inputProps,
  setOpen,
  userId,
  etag,
  disabled,
}: AlertDialogComponentProps) {
  const [error, setError] = useState<string | null>(null);
  const [shareName, setShareName] = useState<string | undefined>(undefined);
  const sliceFileExtension = (file: string | undefined) => {
    if (file) {
      return file.substring(0, file.lastIndexOf("."));
    } else {
      return file || "";
    }
  };

  const baseURL =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}/s/`
      : "";

  const btnClasses = cn(
    type === "rename"
      ? "text-left flex justify-start"
      : type === "deleteSM"
      ? "w-[50px]"
      : "text-left flex justify-start"
  );

  const [isOpen, setIsOpen] = useState(false);
  const fileExtension = inputProps?.defaultValue?.substring(
    inputProps?.defaultValue.lastIndexOf(".")
  );
  const [inputValue, setInputValue] = useState(
    sliceFileExtension(inputProps?.defaultValue) || ""
  );

  const handleInputChange = (str: string) => {
    const regex = /^[a-zA-Z0-9._-]+$/; // Allowable characters: letters, numbers, ., _, -
    regex.test(str) ? setError(null) : setError("Invalid input.");
    setInputValue(str);
  };

  const handleConfirm = () => {
    console.log("onConfirm run");
    if (error && type === "share") {
      return;
    }

    if (isRename && type === "share") {
      onConfirm(inputValue + fileExtension);
      setTimeout(() => {
        checkShare(userId, etag, setShareName);
      }, 100);
    } else if (isRename) {
      onConfirm(inputValue + fileExtension);
    } else {
      onConfirm();
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (type === "share" && userId && etag) {
      checkShare(userId, etag, setShareName);
    }
  }, [userId, etag, setShareName]);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button disabled={disabled} className={btnClasses} variant={variant}>
          {!popOver &&
            (isRename ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <Trash className="h-4 w-4" />
            ))}
          {triggerText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        {shareName && (
          <div className="flex w-full justify-between absolute px-2 pt-2">
            <CopyButton
              toastInfo={{
                title: "Link Copied!",
                description: `${baseURL}${shareName}`,
                variant: "good",
              }}
              copyText={`${baseURL}${shareName}`}
            />
            <AlertDialogComponent
              setOpen={() => {}}
              variant={"destructive"}
              title="Are you absolutely sure?"
              description={`This action cannot be undone. This will permanently the public file '${shareName}'.`}
              triggerText=""
              type="deleteSM"
              onConfirm={() => {
                showToast(`Deleting ${shareName}...`, "", "default");
                // shareFileOp();
              }}
            />
          </div>
        )}
        <AlertDialogHeader>
          <AlertDialogTitle className="text-black">
            {shareName ? "Edit Shared File" : title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-black font-medium">
            {shareName
              ? `This file is already shared as '${shareName}'. Pick a new name to share it as if you'd like (or leave it random).`
              : description}
          </AlertDialogDescription>
          {isRename && inputProps && (
            <>
              <input
                type="text"
                autoFocus={true}
                value={inputValue}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={inputProps.placeholder}
                className="w-full px-3 py-2 text-black border border-gray-600 rounded-md focus:outline-none mt-4"
              />
              {error && type === "share" && (
                <div className="flex w-full cc">
                  <X className="w-4 h-4 stroke-red-500 stroke-[3]" />
                  <p className="text-red-500 font-semibold">{error}</p>
                </div>
              )}
            </>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="border-black text-black"
            onClick={() => setOpen(false)}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!!(error && type === "share")}
            className={cn(
              !isRename
                ? "bg-red-500 text-white hover:bg-red-700 hover:text-white"
                : ""
            )}
            onClick={handleConfirm}
          >
            {shareName ? "Rename" : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
