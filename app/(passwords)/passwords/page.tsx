"use client";

import { useAuth } from "@/lib/useAuth";
import axios from "axios";
import { checkPassAccResponse } from "filegilla";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  EyeIcon,
  EyeOffIcon,
  LockKeyholeIcon,
  Plus,
  X,
} from "lucide-react";
import { showToast } from "@/lib/showToast";
import Loading from "@/components/loading";
import { TailSpin } from "react-loading-icons";
import { password } from "filegilla";
import { PasswordDialog } from "@/components/passwordDialog";
import { PasswordFormData } from "@/lib/schemas";
import { decrypt, encrypt } from "@/lib/cryptoUtils";
import PasswordCard from "@/components/passwordCard";

const Passwords = () => {
  const { session } = useAuth();
  const [hasAccount, setHasAccount] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [passwords, setPasswords] = useState<password[] | null>(null);
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [locked, setLocked] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOperation = async (
    operation: "encrypt" | "decrypt",
    text: string,
    key: string
  ) => {
    try {
      if (!text || !key) return;
      let operationResult: string;

      if (operation === "encrypt") {
        operationResult = await encrypt(text, key);
      } else {
        operationResult = await decrypt(text, key);
      }

      return operationResult;
    } catch (error) {
      console.log(error);
      return "";
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handlePasswordCheck();
    }
  };

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword(!showPassword);
    inputRef.current?.focus();
  };

  const loadPasswords = async () => {
    try {
      if (session?.user.id) {
        const { data } = await axios.post("/api/loadPasswords", {
          userId: session.user.id,
        });

        setPasswords(data.passwords);
      }
    } catch (error) {
      showToast("Error Loading Passwords :(", "", "destructive");
    }
  };

  const handlePasswordCheck = async () => {
    setLoading(true);
    if (password === "") {
      setError("Password cannot be empty");
      setLoading(false);
      return;
    }

    try {
      if (session?.user.id) {
        const { data } = await axios.post("/api/checkPassword", {
          userId: session.user.id,
          password: password,
        });

        setPasswords(data.passwords);
        setLocked(false);
      }
      setLoading(false);
    } catch (error) {
      setError("Authentication failed");
      setLoading(false);
    }
  };

  const checkUserAcc = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/checkPassAcc", {
        params: { userId: session?.user.id },
      });

      const data = res.data as checkPassAccResponse;
      if (!(data.phash === null || data.phash === "null")) {
        setHasAccount(true);
        setLoading(false);
      } else {
        setHasAccount(false);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      showToast(
        "An error occurred checking your passwords :(",
        "",
        "destructive"
      );
    }
  };

  useEffect(() => {
    if (session?.user.id) {
      checkUserAcc();
    }
  }, [session?.user.id]);

  const handleSubmit = async (data: PasswordFormData) => {
    try {
      const cipher = await handleOperation("encrypt", data.password, password);

      const { password: old, ...rest } = data;
      console.log(old ? "" : "");
      const securedData = {
        ...rest,
        cipher,
      };

      if (session?.user.id) {
        await axios.post("/api/addPassword", {
          userId: session.user.id,
          data: securedData,
        });

        await loadPasswords();
        showToast("Successfully Added Password", "", "good");
      }
    } catch (error) {
      showToast("Error Adding Password :(", "Please try again.", "destructive");
    }
  };

  const handleCreatePassword = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      if (session?.user.id) {
        await axios.post("/api/createPassword", {
          userId: session.user.id,
          password: password,
        });

        setHasAccount(true)
      }
    } catch (error) {
      console.log(error);
      showToast("Error when creating your password :(", "", "default");
    }
  };

  return (
    <div className="w-full py-10">
      <div className="w-full max-w-6xl px-6 mx-auto">
        {loading ? (
          <>
            <div className="w-full flex cc">
              <TailSpin
                stroke={"#ffffff"}
                strokeWidth={2}
                width={200}
                height={200}
                speed={2}
              />
            </div>
          </>
        ) : (
          <>
            {hasAccount && locked ? (
              <>
                <div className="w-full flex flex-col items-center justify-center bg-blue">
                  <LockKeyholeIcon size={96} stroke="#ffffff" />
                  <h1 className="text-center text-3xl mt-6 font-bold">
                    Please Authenticate to View or Create Passwords
                  </h1>
                  <div className="relative mt-4 w-full max-w-[256px]">
                    <Input
                      className="text-white w-full bg-black text-md pr-8"
                      placeholder="Enter your password"
                      onKeyDown={handleKeyPress}
                      id="password_login"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      autoFocus={true}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="w-fit h-fit p-0 absolute right-2 top-1/2 -translate-y-1/2 hover:stroke-white hover:text-white hover:bg-transparent border-none"
                      onMouseDown={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    disabled={loading}
                    variant={"pretty"}
                    className="mt-2 w-full max-w-[256px] hover:brightness-75 text-xl duration-500 transition-all"
                    onClick={handlePasswordCheck}
                  >
                    {loading ? (
                      <Loading width={24} height={24} color="#000000" />
                    ) : (
                      "Authenticate"
                    )}
                  </Button>
                  {error && (
                    <div className="flex flex-row items-center justify-center mt-2">
                      <p className="text-red-500">{error}</p>
                      <X
                        className="hover:scale-110 cursor-pointer"
                        size={24}
                        stroke="#ef4444"
                        strokeWidth={1.5}
                        onClick={() => setError("")}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {!hasAccount ? (
                  <>
                    <div className="w-full flex flex-col items-center justify-center">
                      <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-400 to-blue-800 pb-2">
                        Introducing FileGilla Password Storage
                      </h1>
                      <h1 className="text-xl">
                        Securely Store your Passwords with 256-bit AES
                        encryption.
                      </h1>
                      <p>Just create a password to start.</p>
                      <Button
                        onClick={() => setIsOpen(true)}
                        className="text-2xl py-5 px-6 mt-4 bg-white text-black hover:bg-black hover:text-white"
                      >
                        Create Password
                      </Button>
                    </div>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-black">
                            Create Your Password
                          </DialogTitle>
                          <DialogDescription>
                            <div className="flex items-center space-x-2 text-yellow-600 mb-4">
                              <AlertCircle size={20} stroke="#ef4444" />
                              <span className="text-red-500">
                                Warning: This password cannot be recovered.
                                Please write it down and keep it safe.
                              </span>
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-black" htmlFor="password">
                              Password
                            </Label>
                            <Input
                              className="text-black"
                              id="password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label
                              className="text-black"
                              htmlFor="confirmPassword"
                            >
                              Confirm Password
                            </Label>
                            <Input
                              className="text-black"
                              id="confirmPassword"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                            />
                          </div>
                          {error && (
                            <div className="flex flex-row items-center justify-center mt-2">
                              <p className="text-red-500">{error}</p>
                              <X
                                className="hover:scale-110 cursor-pointer"
                                size={24}
                                stroke="#ef4444"
                                strokeWidth={1.5}
                                onClick={() => setError("")}
                              />
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            className="border border-black bg-black"
                            onClick={handleCreatePassword}
                          >
                            Create Password
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <div className="w-full flex flex-col cc">
                    <div className="w-full max-w-3xl flex flex-row items-center justify-start gap-2 mb-4">
                      <PasswordDialog
                        onSubmit={handleSubmit}
                        trigger={
                          <Button className="w-fit p-0 border-none bg-transparent hover:bg-transparent">
                            <div className="border-2 border-white bg-white rounded-lg cursor-pointer hover:bg-black transition-all duration-300">
                              <Plus
                                size={24}
                                className="stroke-black hover:stroke-white transition-all duration-300"
                              />
                            </div>
                          </Button>
                        }
                      />
                      <h1 className="text-2xl font-semibold">
                        Add New Password
                      </h1>
                    </div>
                    {passwords && (
                      <div className="w-full flex flex-col gap-4 cc">
                        {passwords.map((passwordData, index) => (
                          <PasswordCard
                            {...passwordData}
                            password={password}
                            key={index}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Passwords;
