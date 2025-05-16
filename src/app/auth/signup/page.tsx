import type { Metadata } from "next";
import { ModernStunningSignUp } from "@/components/ui/modern-stunning-sign-up";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
};

export default function SignUpPage() {
  return <ModernStunningSignUp />;
}
