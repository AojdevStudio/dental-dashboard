/**
 * @fileoverview Goal Form Component
 *
 * This file implements a form component for creating and editing practice goals
 * in the dental dashboard. It allows users to define goal details, target values,
 * time periods, and other properties.
 */

"use client";

import { DateRangePicker } from "@/components/common/date-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths, endOfMonth, startOfMonth } from "date-fns";
import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

/**
 * Goal category types
 */
type GoalCategory = "financial" | "patient" | "productivity" | "retention" | "other";

/**
 * Schema for goal form validation
 */
const goalFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title must not exceed 100 characters" }),
  description: z
    .string()
    .max(500, { message: "Description must not exceed 500 characters" })
    .optional(),
  category: z.enum(["financial", "patient", "productivity", "retention", "other"]),
  target: z.number().positive({ message: "Target must be a positive number" }),
  unit: z.string().max(10, { message: "Unit must not exceed 10 characters" }).optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  trackingFrequency: z.enum(["daily", "weekly", "monthly"]),
  reminderEnabled: z.boolean(),
});

/**
 * Type for the goal form values
 */
type GoalFormValues = z.infer<typeof goalFormSchema>;

/**
 * Interface for existing goal data
 *
 * @property {string} id - Unique identifier for the goal
 * @property {string} title - Goal title/description
 * @property {string} [description] - Detailed description of the goal
 * @property {GoalCategory} category - Category of the goal
 * @property {number} target - Target value for the goal
 * @property {string} [unit] - Unit of measurement (e.g., "$", "%", "patients")
 * @property {Date} startDate - Start date for the goal period
 * @property {Date} endDate - End date for the goal period
 * @property {string} trackingFrequency - How often to track goal progress
 * @property {boolean} reminderEnabled - Whether reminders are enabled
 */
interface ExistingGoal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  target: number;
  unit?: string;
  startDate: Date;
  endDate: Date;
  trackingFrequency: "daily" | "weekly" | "monthly";
  reminderEnabled: boolean;
}

/**
 * Interface for GoalForm component properties
 *
 * @property {ExistingGoal} [goal] - Existing goal data for editing
 * @property {(values: GoalFormValues) => void} onSubmit - Callback for form submission
 * @property {() => void} [onCancel] - Callback for canceling
 * @property {boolean} [isLoading] - Whether the form is in loading state
 */
interface GoalFormProps {
  goal?: ExistingGoal;
  onSubmit: (values: GoalFormValues) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

/**
 * Category options for the form select
 */
const categoryOptions = [
  { value: "financial", label: "Financial" },
  { value: "patient", label: "Patient" },
  { value: "productivity", label: "Productivity" },
  { value: "retention", label: "Retention" },
  { value: "other", label: "Other" },
];

/**
 * Tracking frequency options for the form select
 */
const trackingFrequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

/**
 * Goal Form Component
 *
 * A form component for creating and editing practice goals.
 * Features include:
 * - Form validation with zod
 * - Input fields for all goal properties
 * - Date range selection
 * - Category and tracking frequency dropdowns
 * - Support for creating new goals or editing existing ones
 *
 * @param {GoalFormProps} props - Component properties
 * @returns {JSX.Element} The rendered goal form component
 */
export function GoalForm({ goal, onSubmit, onCancel, isLoading = false }: GoalFormProps) {
  // Create a form with default values
  const defaultValues = goal
    ? {
        title: goal.title,
        description: goal.description || "",
        category: goal.category,
        target: goal.target,
        unit: goal.unit || "",
        dateRange: {
          from: goal.startDate,
          to: goal.endDate,
        },
        trackingFrequency: goal.trackingFrequency,
        reminderEnabled: goal.reminderEnabled,
      }
    : {
        title: "",
        description: "",
        category: "financial" as GoalCategory,
        target: 0,
        unit: "",
        dateRange: {
          from: startOfMonth(new Date()),
          to: endOfMonth(addMonths(new Date(), 2)),
        },
        trackingFrequency: "monthly",
        reminderEnabled: false,
      };

  // Initialize form with react-hook-form and zod validation
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues,
  });

  // Handle form submission
  const handleSubmit = (values: GoalFormValues) => {
    onSubmit(values);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{goal ? "Edit Goal" : "Create New Goal"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Basic Information</h3>

              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter goal title" {...field} />
                    </FormControl>
                    <FormDescription>A short, descriptive title for your goal</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter detailed description (optional)"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>Additional details about this goal</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category Field */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>The type of goal you're setting</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Target Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Target</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Value Field */}
                <FormField
                  control={form.control}
                  name="target"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>The numeric target you want to achieve</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Unit Field */}
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., $, %, patients" {...field} />
                      </FormControl>
                      <FormDescription>The unit of measurement (optional)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date Range Field */}
              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Period</FormLabel>
                    <FormControl>
                      <DateRangePicker
                        from={field.value.from}
                        to={field.value.to}
                        onRangeChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>The time period for achieving this goal</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Tracking Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Tracking</h3>

              {/* Tracking Frequency Field */}
              <FormField
                control={form.control}
                name="trackingFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {trackingFrequencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>How often to track progress toward this goal</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reminder Enabled Field */}
              <FormField
                control={form.control}
                name="reminderEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Enable Reminders</FormLabel>
                      <FormDescription>Receive notifications about goal progress</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Form action buttons are in CardFooter */}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}

        <Button type="submit" onClick={form.handleSubmit(handleSubmit)} disabled={isLoading}>
          {isLoading ? "Saving..." : goal ? "Save Changes" : "Create Goal"}
        </Button>
      </CardFooter>
    </Card>
  );
}
