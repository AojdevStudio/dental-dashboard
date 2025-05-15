import { Metadata } from 'next'
import { SignIn1 } from '@/components/ui/modern-stunning-sign-in'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account',
}

export default function LoginPage() {
  return <SignIn1 />
} 