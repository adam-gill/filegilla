'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { authClient } from '@/lib/auth/auth-client';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { TailSpin } from 'react-loading-icons';
import { FiXCircle } from 'react-icons/fi';
import { useRouter, useSearchParams } from 'next/navigation';

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

type SignInFormData = z.infer<typeof signInSchema>;

const signUpSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignInForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();


  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', username: '', email: '', password: '' },
  });

  const onSignIn = async (values: SignInFormData) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await authClient.signIn.email({
        ...values,
        callbackURL: "/u"
      });
      if (error) {
        setErrorMsg(error.message || 'Sign in failed.');
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
      const { error } = await authClient.signUp.email({
        ...values,
        callbackURL: "/u"
      });
      if (error) {
        setErrorMsg(error.message || 'Sign up failed.');
      } else {
        setErrorMsg(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: "/u"
      });
      if (error) {
        setErrorMsg(error.message || 'Google sign in failed.');
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
        provider: 'github',
        callbackURL: "/u"
      });
      if (error) {
        setErrorMsg(error.message || 'GitHub sign in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const modeFromUrl = searchParams.get("signUp");

    console.log("modeValue", modeFromUrl)

    if (modeFromUrl === "1") {
      setMode("signup");
    } 

    router.replace("/auth");
  }, [router, searchParams])

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">{mode === 'signin' ? 'Sign In' : 'Sign Up'}</CardTitle>
        <CardDescription className="text-base">{mode === 'signin' ? 'Enter your credentials to sign in.' : 'Create a new account.'}</CardDescription>
      </CardHeader>
      <CardContent>
        {mode === 'signin' ? (
          <form
            onSubmit={signInForm.handleSubmit(onSignIn)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg">Email</Label>
              <Input
                className="text-lg"
                id="email"
                {...signInForm.register('email')}
                disabled={loading}
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-lg">Password</Label>
              <Input
                className="text-lg pr-10"
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...signInForm.register('password')}
                disabled={loading}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-9 transform -translate-y-1/2 text-xl text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                <div className="absolute right-2">
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                </div>
              </button>
            </div>
            <Button type="submit" className="w-full text-lg font-bold cursor-pointer" disabled={loading}>
              {loading ? <TailSpin stroke="#000" width={24} height={24} speed={3} /> : 'Sign In'}
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
              <Label htmlFor="name" className="text-lg">Name</Label>
              <Input
                className="text-lg focus:border-[#60a5fa]"
                id="name"
                {...signUpForm.register('name')}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-lg">Username</Label>
              <Input
                className="text-lg"
                id="username"
                {...signUpForm.register('username')}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg">Email</Label>
              <Input
                className="text-lg"
                id="email"
                {...signUpForm.register('email')}
                disabled={loading}
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-lg">Password</Label>
              <Input
                className="text-lg pr-10"
                id="password"
                type={showSignUpPassword ? 'text' : 'password'}
                {...signUpForm.register('password')}
                disabled={loading}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-9 transform -translate-y-1/2 text-xl text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowSignUpPassword((v) => !v)}
                aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                <div className="absolute right-2">
                  {showSignUpPassword ? <FiEyeOff /> : <FiEye />}
                </div>
              </button>
            </div>
            <Button type="submit" className="w-full text-lg font-bold cursor-pointer" disabled={loading}>
              {loading ? <TailSpin stroke="#000" width={24} height={24} speed={3} /> : 'Sign Up'}
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
          {mode === 'signin' ? (
            <>Don&#39;t have an account? <button type="button" className="text-white hover:underline font-bold cursor-pointer" onClick={() => setMode('signup')} disabled={loading}>Sign up</button></>
          ) : (
            <>Already have an account? <button type="button" className="text-white hover:underline font-bold cursor-pointer" onClick={() => setMode('signin')} disabled={loading}>Sign in</button></>
          )}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button variant="outline" className="w-full text-base font-bold cursor-pointer" onClick={onGoogle} disabled={loading}>
          <FcGoogle className="mr-2 h-6 w-6" /> Google
        </Button>
        <Button variant="outline" className="w-full text-base font-bold cursor-pointer" onClick={onGithub} disabled={loading}>
          <FaGithub className="mr-2 h-6 w-6" /> GitHub
        </Button>
      </CardFooter>
    </Card>
  );
}
