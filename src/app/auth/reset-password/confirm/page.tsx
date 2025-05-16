import { Metadata } from "next"
import { PasswordResetConfirm } from "@/components/ui/password-reset-confirm"

export const metadata: Metadata = {
  title: "Reset Password Confirmation | Unified Dental Dashboard",
  description: "Create a new password for your Unified Dental Dashboard account",
}

export default function ResetPasswordConfirmPage() {
  return <PasswordResetConfirm />
}
