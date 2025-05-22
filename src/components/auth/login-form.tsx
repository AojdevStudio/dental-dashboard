/**
 * @fileoverview Login Form Component
 *
 * This file implements the main login form component used in the authentication flow.
 * It handles user authentication via email and password using Supabase Auth,
 * form validation with Zod, and provides appropriate feedback to users.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";

/**
 * Zod schema for login form validation
 *
 * Defines validation rules for the login form fields:
 * - email: Must be a valid email format
 * - password: Must be at least 8 characters long
 *
 * @type {z.ZodObject}
 */
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

/**
 * Login Form Component
 *
 * Renders a form for user authentication with email and password.
 * Handles form validation, submission to Supabase Auth, and error display.
 * On successful login, redirects the user to the dashboard.
 *
 * @returns {JSX.Element} The rendered login form component
 */
export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Initialize react-hook-form with zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /**
   * Form submission handler
   *
   * Processes the login form submission by:
   * 1. Creating a Supabase browser client
   * 2. Attempting to sign in with the provided credentials
   * 3. Redirecting to dashboard on success
   * 4. Displaying error toast on failure
   * 5. Managing loading state throughout the process
   *
   * @param {z.infer<typeof formSchema>} values - The validated form values containing email and password
   * @returns {Promise<void>} A promise that resolves when the authentication process completes
   * @throws Will be caught internally and displayed as a user-friendly error message
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Initialize Supabase client for browser-side authentication
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Attempt to sign in with email and password
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      // On successful login, refresh the router and redirect to dashboard
      router.refresh();
      router.push("/dashboard");
    } catch (error) {
      // Display user-friendly error message
      toast.error("Invalid email or password. Please try again.");
    } finally {
      // Reset loading state regardless of outcome
      setIsLoading(false);
    }
  }

  /**
   * Render the login form with email and password fields
   *
   * The form includes:
   * - Email input field with validation
   * - Password input field with validation
   * - Submit button with loading indicator
   * - Error messages displayed below each field when validation fails
   *
   * Form fields are disabled during submission to prevent multiple submissions
   */
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Email field with validation */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Password field with validation */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Submit button with loading spinner */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>
    </Form>
  );
}
