import type { Metadata } from "next";
import { PasswordResetRequest } from "@/components/ui/password-reset-request";

export const metadata: Metadata = {
  title: "Reset Password | Unified Dental Dashboard",
  description: "Reset your password for the Unified Dental Dashboard",
};

export default function ResetPasswordPage() {
  return <PasswordResetRequest />;
}
