import { z } from 'zod';

const passwordValidation = z
  .string()
  .describe('Password')
  .min(8, 'Password must be at least 8 characters')
  .refine((password) => /[a-z]/.test(password), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((password) => /[A-Z]/.test(password), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((password) => /\d/.test(password), {
    message: 'Password must contain at least one number',
  })
  .refine((password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), {
    message: 'Password must contain at least one special character',
  });

export const SignUpFormSchema = z
.object({
  name: z.string().describe('Name').min(1, 'Name is required'),
  email: z.string().describe('Email').email({ message: 'Invalid Email' }),
  password: passwordValidation,
  confirmPassword: z
    .string()
    .describe('Confirm Password')
    .min(1, 'Please confirm your password'),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'],
});

export const passwordRequirements = [
  { regex: /.{8,}/, message: 'At least 8 characters' },
  { regex: /[a-z]/, message: 'One lowercase letter' },
  { regex: /[A-Z]/, message: 'One uppercase letter' },
  { regex: /\d/, message: 'One number' },
  { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, message: 'One special character' },
];