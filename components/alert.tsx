"use client";

import React, { ReactNode, useState } from "react";
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

interface AlertDialogComponentProps {
  title: string;
  description: string;
  setOpen: (value: boolean) => void;
  onConfirm: (value?: string) => void; // Modified to accept optional value
  triggerText: ReactNode;
  confirmText?: string;
  cancelText?: string;
  popOver?: boolean;
  type: "share" | "rename" | "delete";
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
}: AlertDialogComponentProps) {
  const [error, setError] = useState<string | null>(null);
  const sliceFileExtension = (file: string | undefined) => {
    if (file) {
      return file.substring(0, file.lastIndexOf("."));
    } else {
      return file || "";
    }
  };

  const btnClasses = cn(
    type === "rename"
      ? "text-left flex justify-start"
      : type === "delete"
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
  }

  const handleConfirm = () => {
    if (error) {
      return;
    }
    if (isRename) {
      onConfirm(inputValue + fileExtension);
    } else {
      onConfirm();
    }
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button className={btnClasses} variant={variant}>
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
        <AlertDialogHeader>
          <AlertDialogTitle className="text-black">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-black font-medium">
            {description}
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
              {error && (
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
            disabled={!!error}
            className={cn(
              !isRename
                ? "bg-red-500 text-white hover:bg-red-700 hover:text-white"
                : ""
            )}
            onClick={handleConfirm}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
