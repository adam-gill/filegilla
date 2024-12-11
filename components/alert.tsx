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
import { Pencil, Trash } from "lucide-react";
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
  popOver,
  isRename,
  inputProps,
  setOpen,
}: AlertDialogComponentProps) {
  const sliceFileExtension = (file: string | undefined) => {
    if (file) {
      return file.substring(0, file.lastIndexOf("."));
    } else {
      return file || "";
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const fileExtension = inputProps?.defaultValue?.substring(inputProps?.defaultValue.lastIndexOf("."));
  const [inputValue, setInputValue] = useState(
    sliceFileExtension(inputProps?.defaultValue) || ""
  );

  const handleConfirm = () => {
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
        <Button
          className={cn(popOver ? "text-left flex justify-start" : "")}
          variant={variant}
        >
          {!popOver &&
            (isRename ? (
              <Pencil className="h-4 w-4 mr-2" />
            ) : (
              <Trash className="h-4 w-4 mr-2" />
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
            <input
              type="text"
              autoFocus={true}
              value={inputValue}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputProps.placeholder}
              className="w-full px-3 py-2 text-black border border-gray-600 rounded-md focus:outline-none mt-4"
            />
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
