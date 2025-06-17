'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FcGoogle } from 'react-icons/fc';

import Logo from '@/public/favicon.png';
import Loader from '@/components/Loader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MailCheck } from 'lucide-react';
import { actionSignUpUser } from '@/lib/auth/signUp';
import { oAuthLogin } from '@/lib/auth/oAuth';
import { SignUpFormSchema } from './SignUpFormSchema';


export default function Signup () {
  const [submitError, setSubmitError] = useState('');
  const [confirmation, setConfirmation] = useState(false);

  const form = useForm<z.infer<typeof SignUpFormSchema>, unknown, z.output<typeof SignUpFormSchema>>({
    mode: 'onBlur',
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: { email: '', name: '', password: '', confirmPassword: '' },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async () => {
    const { email, name, password } = SignUpFormSchema.parse(form.getValues());

    const error = await actionSignUpUser({ email, name, password });
    if (error) {
      setSubmitError(error.message);
      form.reset();
      return;
    }
    setConfirmation(true);
  };

  return (
    <div className="h-screen p-6 flex justify-center">
      <Form {...form}>
        <form

          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
        >
          <Link
            href="/"
            className="w-full flex sm:justify-left items-center justify-center"
          >
            <Image
              src={Logo}
              alt="Conspecto Logo"
              width={50}
              height={50}
            />
            <span
              className="font-semibold dark:text-white text-4xl first-letter:ml-2"
            >
              Conspecto
            </span>
          </Link>
          <FormDescription
            className="text-foreground/60"
          >
            Notes Reimagined: Capture, Question, Master
          </FormDescription>
          {!confirmation && !submitError && (
            <>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Your Name"
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
              <FormField
                disabled={isLoading}
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm Password"
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
                disabled={isLoading}
              >
                {!isLoading ? 'Create Account' : <Loader />}
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

            </>
          )}

          {submitError && <FormMessage>{submitError}</FormMessage>}
          <span className="self-container">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-yellow-500"
            >
              Login
            </Link>
          </span>
          {(confirmation || submitError) && (
            <>
              <Alert className='bg-red-500/10 border-red-500/50 text-red-700'>
                {!submitError && <MailCheck className="h-4 w-4" />}
                <AlertTitle>
                  {submitError ? 'Invalid Link' : 'Check your email.'}
                </AlertTitle>
                <AlertDescription>
                  {submitError || 'An email confirmation has been sent.'}
                </AlertDescription>
              </Alert>
            </>
          )}
        </form>
      </Form>
    </div>
  );
};
