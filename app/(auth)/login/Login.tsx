'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormLoginSchema } from '@/types/Auth';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import Link from 'next/link';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';

import Logo from '@/public/favicon.png';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Loader from '@/components/Loader';
import { Separator } from '@/components/ui/separator';
import { actionLoginUser } from '@/lib/auth/login';
import { oAuthLogin } from '@/lib/auth/oAuth';
import { useUser } from '@/lib/context/UserContext';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [submitError, setSubmitError] = useState('');
  const oauthError = searchParams.get('oauthError');
  const verificationError = searchParams.get('error');
  const user = useUser();

  if (user !== null) {
    console.log(user)
    router.replace("/dashboard")
  }

  const form = useForm<z.infer<typeof FormLoginSchema>, unknown, z.output<typeof FormLoginSchema>>({
    mode: 'onBlur',
    resolver: zodResolver(FormLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(
    async () => {
      const { email, password } = FormLoginSchema.parse(form.getValues());
      const error = await actionLoginUser({ email, password });
      if (error) {
        form.reset();
        setSubmitError(error.message);
      }
      router.replace('/dashboard');
    },
    (errors) => {
      console.error('Validation errors:', errors);
    }
  );

  return (
    <div className="h-screen p-6 flex justify-center">
      <Form {...form}>
        <form
          onChange={() => {
            if (submitError) setSubmitError('');
            router.replace('/login');
          }}
          onSubmit={onSubmit}
          className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
        >
          <Link
            href="/"
            className="w-full flex justify-left items-center"
          >
            <Image
              src={Logo}
              alt="Conspecto Logo"
              width={50}
              height={50}
            />
            <span className="font-semibold dark:text-white text-4xl first-letter:ml-2">
              Conspecto
            </span>
          </Link>
          <FormDescription className="text-foreground/60">
            Notes Reimagined: Capture, Question, Master
          </FormDescription>
          <FormMessage className="text-destructive">
            {oauthError || submitError || verificationError}
          </FormMessage>
          <FormField
            disabled={isLoading}
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            disabled={isLoading}
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator />
          <Button
            type="submit"
            className="w-full p-6"
            size="lg"
            disabled={isLoading}
          >
            {!isLoading ? 'Login' : <Loader />}
          </Button>

          <Button
            type='button'
            className="w-full p-6"
            size="lg"
            disabled={isLoading}
            onClick={() => oAuthLogin('google')}
          >
            <FcGoogle className="mr-2 h-4 w-4" />
            Google
          </Button>

          <span className="self-container">
            Dont have an account?{' '}
            <Link
              href="/signup"
              className="text-yellow-500"
            >
              Sign Up
            </Link>
          </span>
        </form>
      </Form>
    </div>
  );
};
