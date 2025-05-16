"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from '@supabase/ssr'
import { Button } from "./button"
import { Input } from "./input"

export function PasswordResetRequest() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleResetRequest = async () => {
    setError("")
    setSuccess("")
    
    if (!email) {
      setError("Please enter your email address.")
      return
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.")
      return
    }
    
    setIsLoading(true)
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables')
      }
      
      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password/confirm`,
      })
      
      if (resetError) {
        throw resetError
      }
      
      setSuccess("Password reset instructions have been sent to your email.")
      setEmail("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send password reset email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden w-full rounded-xl">
      {/* Centered glass card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white/20 mb-6 shadow-lg">
          <img 
            src="/logo.svg" 
            alt="Unified Dental Dashboard Logo" 
            width="64" 
            height="64" 
            className="w-16 h-16" 
          />
        </div>
        {/* Title */}
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          Reset Your Password
        </h2>
        {/* Form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            <Input
              placeholder="Email"
              type="email"
              value={email}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            {error && (
              <div className="text-sm text-red-400 text-left">{error}</div>
            )}
            {success && (
              <div className="text-sm text-green-400 text-left">{success}</div>
            )}
          </div>
          <hr className="opacity-10" />
          <div>
            <Button
              type="button"
              onClick={handleResetRequest}
              className="w-full bg-white/10 text-white font-medium px-5 py-3 rounded-full shadow hover:bg-white/20 transition mb-3 text-sm relative"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : "Send Reset Instructions"}
            </Button>
            <div className="w-full text-center mt-2">
              <span className="text-xs text-gray-400">
                Remember your password?{" "}
                <a
                  href="/auth/login"
                  className="underline text-white/80 hover:text-white"
                >
                  Sign in
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
