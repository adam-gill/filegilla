"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { authClient } from "@/lib/auth/auth-client";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { TailSpin } from "react-loading-icons";
import { FiXCircle } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { sendCode, setEmailToVerified, verifyCode } from "../actions";
import { toast } from "@/hooks/use-toast";

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

type SignInFormData = z.infer<typeof signInSchema>;

const signUpSchema = z.object({
  name: z.string().min(2),
  username: z
    .string()
    .min(1, "username cannot be empty")
    .max(50, "username must 50 characters or less")
    .refine((v) => !/\s/.test(v), "username cannot contain spaces")
    .regex(
      /^[a-z0-9_]+$/,
      "only lowercase letters, numbers, and underscores are allowed"
    ),
  email: z.email(),
  password: z.string().min(8),
  verificationCode: z.string().min(6, "6-digit code is needed to signup"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignInForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [codeIsDisabled, setCodeIsDisabled] = useState<boolean>(false);
  const [refreshTime, setRefreshTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [codeIsLoading, setCodeIsLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      verificationCode: "",
    },
  });

  const onSignIn = async (values: SignInFormData) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await authClient.signIn.email({
        ...values,
        callbackURL: "/u",
      });
      if (error) {
        setErrorMsg(error.message || "Sign in failed.");
      } else {
        setErrorMsg(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const onSignUp = async (values: SignUpFormData) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const valid = await signUpForm.trigger();
      if (!valid) {
        const fieldErrors = signUpForm.formState.errors;
        const messages = Object.values(fieldErrors)
          .map((err) => err?.message)
          .filter(Boolean)
          .join(" • ");

        setErrorMsg(
          messages || "please fill out the form correctly before signing up."
        );
        return;
      }

      const { success, message } = await handleCodeVerification();

      if (!success) {
        setErrorMsg(message || "verification failed. please check your code.");
        return;
      }

      const { error, data } = await authClient.signUp.email({
        ...values,
        callbackURL: "/u",
      });

      if (error) {
        setErrorMsg(error.message || "sign up failed.");
        return;
      }

      if (data?.user?.id) {
        await setEmailToVerified(data.user.id);
      }

      setErrorMsg(null);
      router.push("/u");
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/u",
      });
      if (error) {
        setErrorMsg(error.message || "Google sign in failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onGithub = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/u",
      });
      if (error) {
        setErrorMsg(error.message || "GitHub sign in failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const verificationRegister = signUpForm.register("verificationCode");
  const handleVerificationCodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    const limited = digitsOnly.slice(0, 6);
    setVerificationCode(limited);

    signUpForm.setValue("verificationCode", limited, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleSendCode = async () => {
    setErrorMsg(null);

    const valid = await signUpForm.trigger(["name", "email"]);
    if (!valid) {
      setErrorMsg(
        "please enter a valid name and email before requesting a code."
      );
      return;
    }

    const { name, email } = signUpForm.getValues();
    if (!name || !email) {
      setErrorMsg("please provide a name and email.");
      return;
    }

    try {
      setCodeIsDisabled(true);
      setCodeIsLoading(true);

      const { success, message } = await sendCode(name, email);

      if (!success) {
        setErrorMsg(message || "failed to send verification code.");
        setCodeIsDisabled(false);
      } else {
        toast({
          title: "verification sent",
          description: "check your email for the verification code",
          variant: "good",
        });
        setErrorMsg(null);
        setRefreshTime(Date.now() + 30000);
        setCountdown(30);
      }
    } catch (error) {
      setErrorMsg(`unknown error sending verification code: ${error}`);
      setCodeIsDisabled(false);
    } finally {
      setCodeIsLoading(false);
    }
  };

  const handleCodeVerification = async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    const valid = await signUpForm.trigger(["verificationCode"]);
    if (!valid) {
      return {
        success: false,
        message: "you need to enter an email verification code to signup",
      };
    }

    const { email, verificationCode } = signUpForm.getValues();

    if (!verificationCode || !email) {
      return {
        success: false,
        message: "you need to enter an email verification code to signup",
      };
    }

    try {
      const { success, message } = await verifyCode(verificationCode, email);

      if (!success) {
        return {
          success: false,
          message: message,
        };
      } else {
        return {
          success: true,
          message: message,
        };
      }
    } catch {
      return {
        success: false,
        message: "failed to verify code, please try again",
      };
    }
  };

  useEffect(() => {
    const modeFromUrl = searchParams.get("signUp");

    if (modeFromUrl === "1") {
      setMode("signup");
      router.replace("/auth");
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (refreshTime === null) return;

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((refreshTime - Date.now()) / 1000)
      );
      setCountdown(remaining);

      if (remaining === 0) {
        setCodeIsDisabled(false);
        setRefreshTime(null);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [refreshTime]);

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">
          {mode === "signin" ? "sign in" : "sign up"}
        </CardTitle>
        <CardDescription className="text-base">
          {mode === "signin"
            ? "enter your credentials to sign in."
            : "create a new account."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mode === "signin" ? (
          <form
            onSubmit={signInForm.handleSubmit(onSignIn)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg">
                email
              </Label>
              <Input
                className="text-lg"
                id="email"
                {...signInForm.register("email")}
                disabled={loading}
              />
              {signInForm.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {signInForm.formState.errors.email.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-lg">
                password
              </Label>
              <Input
                className="text-lg pr-10"
                id="password"
                type={showPassword ? "text" : "password"}
                {...signInForm.register("password")}
                disabled={loading}
              />
              {signInForm.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {signInForm.formState.errors.password.message as string}
                </p>
              )}
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-9 transform -translate-y-1/2 text-xl text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                <div className="absolute right-2">
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </div>
              </button>
            </div>
            <Button
              type="submit"
              className="w-full text-lg font-bold cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <TailSpin stroke="#000" width={24} height={24} speed={3} />
              ) : (
                "sign in"
              )}
            </Button>
            {errorMsg && (
              <div className="flex items-center justify-center">
                <span className="text-red-600 text-base flex items-center bg-transparent border-none px-3 py-2 rounded shadow border border-red-200">
                  <FiXCircle
                    className="mr-2 cursor-pointer text-red-500 hover:text-red-700"
                    size={22}
                    onClick={() => setErrorMsg(null)}
                  />
                  {errorMsg}
                </span>
              </div>
            )}
          </form>
        ) : (
          <form
            onSubmit={signUpForm.handleSubmit(onSignUp)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg">
                name
              </Label>
              <Input
                className="text-lg focus:border-[#60a5fa]"
                id="name"
                {...signUpForm.register("name")}
                disabled={loading}
              />
              {signUpForm.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {signUpForm.formState.errors.name.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-lg">
                username
              </Label>
              <Input
                className="text-lg"
                id="username"
                {...signUpForm.register("username")}
                disabled={loading}
              />
              {signUpForm.formState.errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {signUpForm.formState.errors.username.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg">
                email
              </Label>
              <Input
                className="text-lg"
                id="email"
                {...signUpForm.register("email")}
                disabled={loading}
              />
              {signUpForm.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {signUpForm.formState.errors.email.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-lg">
                password
              </Label>
              <Input
                className="text-lg pr-10"
                id="password"
                type={showSignUpPassword ? "text" : "password"}
                {...signUpForm.register("password")}
                disabled={loading}
              />
              {signUpForm.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {signUpForm.formState.errors.password.message as string}
                </p>
              )}
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-9 transform -translate-y-1/2 text-xl text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowSignUpPassword((v) => !v)}
                aria-label={
                  showSignUpPassword ? "Hide password" : "Show password"
                }
                disabled={loading}
              >
                <div className="absolute right-2">
                  {showSignUpPassword ? <FiEyeOff /> : <FiEye />}
                </div>
              </button>
            </div>

            <div className="flex flex-col items-end">
              <div className="w-full flex justify-between items-end">
                <div className="flex flex-col w-full pr-6">
                  <Label htmlFor="verificationCode" className="text-lg">
                    verification code
                  </Label>
                  <Input
                    className="text-lg pr-4"
                    id="verificationCode"
                    type={"text"}
                    {...verificationRegister}
                    value={verificationCode}
                    disabled={loading}
                    inputMode="numeric"
                    aria-invalid={
                      !!signUpForm.formState.errors.verificationCode
                    }
                    onChange={(e) => {
                      handleVerificationCodeChange(e.target.value);
                      if (
                        verificationRegister &&
                        typeof (verificationRegister as any).onChange ===
                          "function"
                      ) {
                        (verificationRegister as any).onChange(e);
                      }
                    }}
                  />
                </div>
                <Button
                  className="cursor-pointer"
                  onClick={handleSendCode}
                  disabled={codeIsDisabled || codeIsLoading || loading}
                >
                  {codeIsDisabled || codeIsLoading ? (
                    <div className="flex items-center gap-2">
                      <TailSpin
                        stroke="#000"
                        width={20}
                        height={20}
                        speed={3}
                      />
                      {codeIsDisabled && countdown > 0 && (
                        <span>{countdown}s</span>
                      )}
                    </div>
                  ) : (
                    "send code"
                  )}
                </Button>
              </div>
              <div className="flex justify-start w-full">
                {signUpForm.formState.errors.verificationCode && (
                  <p className="text-red-500 text-sm mt-1">
                    {
                      signUpForm.formState.errors.verificationCode
                        .message as string
                    }
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full text-lg font-bold cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <TailSpin stroke="#000" width={24} height={24} speed={3} />
              ) : (
                "sign up"
              )}
            </Button>
            {errorMsg && (
              <div className="flex items-center justify-center">
                <span className="text-red-600 text-base flex items-center bg-transparent border-none px-3 py-2 rounded shadow border border-red-200">
                  <FiXCircle
                    className="mr-2 cursor-pointer text-red-500 hover:text-red-700"
                    size={22}
                    onClick={() => setErrorMsg(null)}
                  />
                  {errorMsg}
                </span>
              </div>
            )}
          </form>
        )}
        <p className="text-center text-base mt-4">
          {mode === "signin" ? (
            <>
              don&#39;t have an account?{" "}
              <button
                type="button"
                className="text-white hover:underline font-bold cursor-pointer"
                onClick={() => setMode("signup")}
                disabled={loading}
              >
                sign up
              </button>
            </>
          ) : (
            <>
              already have an account?{" "}
              <button
                type="button"
                className="text-white hover:underline font-bold cursor-pointer"
                onClick={() => setMode("signin")}
                disabled={loading}
              >
                sign in
              </button>
            </>
          )}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button
          variant="outline"
          className="w-full text-base font-bold cursor-pointer"
          onClick={onGoogle}
          disabled={loading}
        >
          <FcGoogle className="mr-2 h-6 w-6" /> google
        </Button>
        <Button
          variant="outline"
          className="w-full text-base font-bold cursor-pointer"
          onClick={onGithub}
          disabled={loading}
        >
          <FaGithub className="mr-2 h-6 w-6" /> github
        </Button>
      </CardFooter>
    </Card>
  );
}
