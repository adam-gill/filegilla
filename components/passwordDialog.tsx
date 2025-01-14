"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { passwordSchema, PasswordFormData } from "@/lib/schemas";
import { EyeIcon, EyeOffIcon, Trash } from "lucide-react";
import { AlertDialogComponent } from "./alert";
import { showToast } from "@/lib/showToast";
import axios from "axios";

interface passwordEdit {
  password: string;
  url?: string;
  description: string;
  time_created: string;
  title: string;
  user_id: string;
  password_id: number;
}

interface PasswordDialogProps {
  initialData?: passwordEdit;
  onSubmit: (data: PasswordFormData, isEditing: boolean, password_id?: number) => void;
  trigger: React.ReactNode;
  loadPasswords: () => Promise<void>;
}

export function PasswordDialog({
  initialData,
  onSubmit,
  trigger,
  loadPasswords,
}: PasswordDialogProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const isEditing = !!initialData;
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: initialData || {
      password: "",
      title: "",
      url: "",
      description: "",
    },
  });

  const handleSubmit = (data: PasswordFormData) => {
    onSubmit(data, isEditing, initialData?.password_id);
    setOpen(false);
    form.reset();
  };

  const deletePassword = async () => {
    if (initialData) {
      try {
        await axios.post("/api/deletePassword", {
          user_id: initialData.user_id,
          password_id: initialData.password_id,
        });
        showToast(
          `Successfully deleted the ${initialData.title} password.`,
          "",
          "good"
        );

        await loadPasswords();

      } catch (error) {
        showToast(
          `Failed to delete ${initialData.title} password :(`,
          "",
          "good"
        );
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-black">
            {isEditing ? "Edit Password" : "Add New Password"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit your stored password information here."
              : "Enter the details for your new password entry."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 text-black"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        {...field}
                      />
                      <Button
                        tabIndex={-1}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <div className={isEditing ? "flex w-full flex-row justify-between": ""}>
                {isEditing && (
                  <AlertDialogComponent
                    title="Are you absolutely sure?"
                    variant="destructive"
                    setOpen={setIsOpen}
                    popOver={true}
                    description={`This action cannot be undone. This will permanently delete the ${initialData.title} password. ${isOpen ? "" : ""}`}
                    triggerText={<Trash className="h-4 w-4 stroke-white" />}
                    onConfirm={() => {
                      showToast(
                        `Deleting ${initialData.title}...`,
                        "",
                        "default"
                      );
                      setOpen(false);
                      deletePassword();
                    }}
                  />
                )}
                <div>
                  <Button
                    type="button"
                    onClick={() => setOpen(false)}
                    variant="outline"
                    className="text-black hover:bg-gray-100 mr-2"
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditing ? "Save Changes" : "Add Password"}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
