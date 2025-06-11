/**
 * @file Comprehensive multi-step user registration form component.
 *
 * @description This file defines the `RegisterFormComprehensive` component,
 * which guides users through a multi-step registration process. It handles
 * account information, role selection, clinic association (joining an existing
 * or creating a new one), and terms/agreements. The component manages its
 * own state for form data, current step, loading status, and errors.
 * It uses various UI components from Shadcn/ui for its layout and inputs.
 */
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type * as React from 'react';
import { useState } from 'react';

interface RegistrationFormData {
  // Core fields
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone?: string;

  // Role and clinic
  role: 'admin' | 'office_manager' | 'dentist' | 'front_desk';
  clinicMode: 'join' | 'create';
  primaryClinicId?: string;
  clinicRegistrationCode?: string;

  // New clinic (if creating)
  newClinic?: {
    name: string;
    location: string;
    practiceType: string;
  };

  // Provider fields (conditional)
  providerInfo?: {
    licenseNumber?: string;
    specialties: string[];
    providerType: string;
    employmentStatus: string;
  };

  // Agreements
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingOptIn: boolean;
}

/**
 * @function RegisterFormComprehensive
 * @description A comprehensive, multi-step registration form component.
 * It handles user input for account creation, role selection, clinic association,
 * and agreement to terms. The form is divided into logical steps to improve
 * user experience.
 *
 * This component manages its internal state for form data, current step,
 * loading indicators, and error messages. It uses various UI elements
 * from `@/components/ui` for consistent styling.
 *
 * On successful registration, it navigates the user to the login page
 * with a success indicator.
 *
 * @returns {JSX.Element} The rendered multi-step registration form.
 * @example
 * <RegisterFormComprehensive />
 */
export function RegisterFormComprehensive() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: 'office_manager',
    clinicMode: 'join',
    termsAccepted: false,
    privacyAccepted: false,
    marketingOptIn: false,
  });

  /**
   * @function handleNextStep
   * @description Advances the user to the next step in the registration form.
   * Performs validation for the current step's fields before proceeding.
   * If validation fails, an error message is set and displayed.
   * Clears any existing error messages before moving to the next step.
   * @memberof RegisterFormComprehensive
   */
  const handleNextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      if (
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword ||
        !formData.fullName
      ) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
    }

    setError(null);
    setCurrentStep(currentStep + 1);
  };

  /**
   * @function handlePreviousStep
   * @description Navigates the user to the previous step in the registration form.
   * Clears any existing error messages.
   * @memberof RegisterFormComprehensive
   */
  const handlePreviousStep = () => {
    setError(null);
    setCurrentStep(currentStep - 1);
  };

  /**
   * @async
   * @function handleSubmit
   * @description Handles the final submission of the registration form.
   * Performs final validation (e.g., terms acceptance).
   * Sends the registration data to the `/api/auth/register-comprehensive` endpoint.
   * Manages loading state and displays success or error messages based on the API response.
   * Redirects to the login page on successful registration.
   * @param {React.FormEvent} e - The form submission event.
   * @memberof RegisterFormComprehensive
   * @throws Will set an error state if the API request fails or returns an error.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation
    if (!formData.termsAccepted || !formData.privacyAccepted) {
      setError('You must accept the terms and privacy policy');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register-comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Success - redirect to login with success message
        router.push(`/login?registered=true&email=${encodeURIComponent(formData.email)}`);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Account Information
  /**
   * @function renderStep1
   * @description Renders the UI elements for the first step of the registration form (Account Information).
   * This includes fields for email, password, confirm password, and full name.
   * @returns {JSX.Element} The JSX for the account information step.
   * @memberof RegisterFormComprehensive
   */
  const renderStep1 = () => (
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <Label for="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your@email.com"
            required={true}
            disabled={loading}
            class="w-full"
          />
        </div>

        <div class="space-y-2">
          <Label for="fullName">Full Name *</Label>
          <Input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Dr. Jane Smith"
            required={true}
            disabled={loading}
            class="w-full"
          />
        </div>
      </div>

      <div class="space-y-2">
        <Label for="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="(555) 123-4567"
          disabled={loading}
          class="w-full max-w-md"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <Label for="password">Password *</Label>
          <div class="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 8 characters"
              required={true}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="confirmPassword">Confirm Password *</Label>
          <div class="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm your password"
              required={true}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Role & Clinic
  /**
   * @function renderStep2
   * @description Renders the UI elements for the second step of the registration form (Role & Clinic Setup).
   * This includes fields for selecting user role, choosing to join or create a clinic,
   * and providing clinic details or registration codes. Conditional fields for provider information
   * may also be rendered here based on the selected role.
   * @returns {JSX.Element} The JSX for the role and clinic setup step.
   * @memberof RegisterFormComprehensive
   */
  const renderStep2 = () => (
    <div class="space-y-4">
      <div class="space-y-2">
        <Label for="role">Your Role *</Label>
        <Select
          value={formData.role}
          onValueChange={(value: RegistrationFormData['role']) =>
            setFormData({ ...formData, role: value })
          }
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrator</SelectItem>
            <SelectItem value="office_manager">Office Manager</SelectItem>
            <SelectItem value="dentist">Dentist/Provider</SelectItem>
            <SelectItem value="front_desk">Front Desk Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <Label>Clinic Association *</Label>
        <RadioGroup
          value={formData.clinicMode}
          onValueChange={(value: RegistrationFormData['clinicMode']) =>
            setFormData({ ...formData, clinicMode: value })
          }
        >
          <div class="flex items-center space-x-2">
            <RadioGroupItem value="join" id="join" />
            <Label for="join" class="font-normal cursor-pointer">
              Join an existing clinic
            </Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem value="create" id="create" />
            <Label for="create" class="font-normal cursor-pointer">
              Create a new clinic
            </Label>
          </div>
        </RadioGroup>
      </div>

      {formData.clinicMode === 'join' ? (
        <div class="space-y-2">
          <Label for="clinicCode">Clinic Registration Code *</Label>
          <Input
            id="clinicCode"
            type="text"
            value={formData.clinicRegistrationCode || ''}
            onChange={(e) => setFormData({ ...formData, clinicRegistrationCode: e.target.value })}
            placeholder="Enter the code provided by your clinic"
            disabled={loading}
          />
          <p class="text-sm text-gray-500">Ask your clinic administrator for this code</p>
        </div>
      ) : (
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="clinicName">Clinic Name *</Label>
            <Input
              id="clinicName"
              type="text"
              value={formData.newClinic?.name || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  newClinic: {
                    name: e.target.value,
                    location: formData.newClinic?.location || '',
                    practiceType: formData.newClinic?.practiceType || '',
                  },
                })
              }
              placeholder="Smith Dental Clinic"
              disabled={loading}
            />
          </div>

          <div class="space-y-2">
            <Label for="clinicLocation">Clinic Location *</Label>
            <Input
              id="clinicLocation"
              type="text"
              value={formData.newClinic?.location || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  newClinic: {
                    name: formData.newClinic?.name || '',
                    location: e.target.value,
                    practiceType: formData.newClinic?.practiceType || '',
                  },
                })
              }
              placeholder="123 Main St, City, State"
              disabled={loading}
            />
          </div>

          <div class="space-y-2">
            <Label for="practiceType">Practice Type *</Label>
            <Select
              value={formData.newClinic?.practiceType || ''}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  newClinic: {
                    name: formData.newClinic?.name || '',
                    location: formData.newClinic?.location || '',
                    practiceType: value,
                  },
                })
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select practice type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Dentistry</SelectItem>
                <SelectItem value="orthodontics">Orthodontics</SelectItem>
                <SelectItem value="pediatric">Pediatric Dentistry</SelectItem>
                <SelectItem value="periodontics">Periodontics</SelectItem>
                <SelectItem value="endodontics">Endodontics</SelectItem>
                <SelectItem value="oral_surgery">Oral Surgery</SelectItem>
                <SelectItem value="multi_specialty">Multi-Specialty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Provider-specific fields */}
      {formData.role === 'dentist' && (
        <div class="space-y-4 pt-4 border-t">
          <h4 class="font-medium">Provider Information</h4>

          <div class="space-y-2">
            <Label for="licenseNumber">License Number</Label>
            <Input
              id="licenseNumber"
              type="text"
              value={formData.providerInfo?.licenseNumber || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  providerInfo: {
                    licenseNumber: e.target.value,
                    specialties: formData.providerInfo?.specialties || [],
                    providerType: formData.providerInfo?.providerType || '',
                    employmentStatus: formData.providerInfo?.employmentStatus || '',
                  },
                })
              }
              placeholder="DDS12345"
              disabled={loading}
            />
          </div>

          <div class="space-y-2">
            <Label for="providerType">Provider Type *</Label>
            <Select
              value={formData.providerInfo?.providerType || ''}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  providerInfo: {
                    licenseNumber: formData.providerInfo?.licenseNumber || '',
                    specialties: formData.providerInfo?.specialties || [],
                    providerType: value,
                    employmentStatus: formData.providerInfo?.employmentStatus || '',
                  },
                })
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dentist">Dentist</SelectItem>
                <SelectItem value="hygienist">Dental Hygienist</SelectItem>
                <SelectItem value="specialist">Specialist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="employmentStatus">Employment Status *</Label>
            <Select
              value={formData.providerInfo?.employmentStatus || ''}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  providerInfo: {
                    licenseNumber: formData.providerInfo?.licenseNumber || '',
                    specialties: formData.providerInfo?.specialties || [],
                    providerType: formData.providerInfo?.providerType || '',
                    employmentStatus: value,
                  },
                })
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">Full-time</SelectItem>
                <SelectItem value="part_time">Part-time</SelectItem>
                <SelectItem value="associate">Associate</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );

  // Step 3: Terms & Agreements
  /**
   * @function renderStep3
   * @description Renders the UI elements for the third and final step of the registration form (Terms & Agreements).
   * This includes checkboxes for accepting terms of service and privacy policy, an optional
   * marketing opt-in, and a summary of the registration details.
   * @returns {JSX.Element} The JSX for the terms and agreements step.
   * @memberof RegisterFormComprehensive
   */
  const renderStep3 = () => (
    <div class="space-y-4">
      <div class="space-y-4">
        <div class="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={formData.termsAccepted}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, termsAccepted: checked as boolean })
            }
            disabled={loading}
          />
          <div class="space-y-1">
            <Label for="terms" class="font-normal cursor-pointer">
              I accept the{' '}
              <Link href="/terms" class="text-blue-600 hover:underline">
                Terms of Service
              </Link>{' '}
              *
            </Label>
            <p class="text-sm text-gray-500">You must accept the terms to continue</p>
          </div>
        </div>

        <div class="flex items-start space-x-2">
          <Checkbox
            id="privacy"
            checked={formData.privacyAccepted}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, privacyAccepted: checked as boolean })
            }
            disabled={loading}
          />
          <div class="space-y-1">
            <Label for="privacy" class="font-normal cursor-pointer">
              I accept the{' '}
              <Link href="/privacy" class="text-blue-600 hover:underline">
                Privacy Policy
              </Link>{' '}
              *
            </Label>
            <p class="text-sm text-gray-500">We take your privacy seriously</p>
          </div>
        </div>

        <div class="flex items-start space-x-2">
          <Checkbox
            id="marketing"
            checked={formData.marketingOptIn}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, marketingOptIn: checked as boolean })
            }
            disabled={loading}
          />
          <div class="space-y-1">
            <Label for="marketing" class="font-normal cursor-pointer">
              Send me updates about new features and dental practice tips
            </Label>
            <p class="text-sm text-gray-500">You can unsubscribe at any time</p>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="font-medium mb-2">Registration Summary</h4>
        <dl class="space-y-1 text-sm">
          <div class="flex justify-between">
            <dt class="text-gray-600">Email:</dt>
            <dd class="font-medium">{formData.email}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-600">Name:</dt>
            <dd class="font-medium">{formData.fullName}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-600">Role:</dt>
            <dd class="font-medium capitalize">{formData.role.replace('_', ' ')}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-600">Clinic:</dt>
            <dd class="font-medium">
              {formData.clinicMode === 'join'
                ? `Joining with code: ${formData.clinicRegistrationCode}`
                : `Creating: ${formData.newClinic?.name}`}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );

  return (
    <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-4xl">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Dental Analytics Dashboard</h1>
          <p class="mt-2 text-lg text-gray-600">Complete your registration to get started</p>
        </div>

        <Card class="w-full shadow-lg">
          <CardHeader class="space-y-1 pb-6">
            <CardTitle class="text-2xl">Create Your Account</CardTitle>
            <CardDescription class="text-base">
              Step {currentStep} of 3 -{' '}
              {currentStep === 1
                ? 'Account Information'
                : currentStep === 2
                  ? 'Role & Clinic Setup'
                  : 'Review & Complete'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {error && (
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              <div class="flex justify-between mt-6">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
                    disabled={loading}
                  >
                    Previous
                  </Button>
                )}

                <div class="ml-auto space-x-2">
                  {currentStep < 3 ? (
                    <Button type="button" onClick={handleNextStep} disabled={loading}>
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading || !formData.termsAccepted || !formData.privacyAccepted}
                    >
                      {loading ? 'Creating Account...' : 'Complete Registration'}
                    </Button>
                  )}
                </div>
              </div>

              <div class="text-center text-sm mt-6">
                Already have an account?{' '}
                <Link href="/login" class="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
