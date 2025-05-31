/**
 * Standard metric definitions for dental practices
 * These are the core KPIs that most dental practices track
 */

export interface MetricDefinition {
  name: string;
  description: string;
  dataType: 'currency' | 'percentage' | 'integer' | 'decimal' | 'date';
  category: 'financial' | 'patient' | 'appointment' | 'provider' | 'treatment';
  isComposite: boolean;
  calculationFormula?: string;
  unit?: string;
}

export const STANDARD_METRICS: MetricDefinition[] = [
  // Financial Metrics
  {
    name: 'daily_production',
    description: 'Total production amount for the day',
    dataType: 'currency',
    category: 'financial',
    isComposite: false,
    unit: 'USD'
  },
  {
    name: 'daily_collection',
    description: 'Total collections received for the day',
    dataType: 'currency',
    category: 'financial',
    isComposite: false,
    unit: 'USD'
  },
  {
    name: 'collection_rate',
    description: 'Percentage of production collected',
    dataType: 'percentage',
    category: 'financial',
    isComposite: true,
    calculationFormula: '(daily_collection / daily_production) * 100'
  },
  {
    name: 'insurance_ar',
    description: 'Insurance accounts receivable balance',
    dataType: 'currency',
    category: 'financial',
    isComposite: false,
    unit: 'USD'
  },
  {
    name: 'patient_ar',
    description: 'Patient accounts receivable balance',
    dataType: 'currency',
    category: 'financial',
    isComposite: false,
    unit: 'USD'
  },

  // Patient Metrics
  {
    name: 'new_patients',
    description: 'Number of new patients',
    dataType: 'integer',
    category: 'patient',
    isComposite: false
  },
  {
    name: 'total_patients_seen',
    description: 'Total number of patients seen',
    dataType: 'integer',
    category: 'patient',
    isComposite: false
  },
  {
    name: 'active_patients',
    description: 'Number of active patients in practice',
    dataType: 'integer',
    category: 'patient',
    isComposite: false
  },
  {
    name: 'patient_retention_rate',
    description: 'Percentage of patients retained',
    dataType: 'percentage',
    category: 'patient',
    isComposite: true,
    calculationFormula: '(returning_patients / total_patients_previous_period) * 100'
  },

  // Appointment Metrics
  {
    name: 'scheduled_appointments',
    description: 'Number of appointments scheduled',
    dataType: 'integer',
    category: 'appointment',
    isComposite: false
  },
  {
    name: 'completed_appointments',
    description: 'Number of appointments completed',
    dataType: 'integer',
    category: 'appointment',
    isComposite: false
  },
  {
    name: 'cancelled_appointments',
    description: 'Number of appointments cancelled',
    dataType: 'integer',
    category: 'appointment',
    isComposite: false
  },
  {
    name: 'no_show_appointments',
    description: 'Number of no-show appointments',
    dataType: 'integer',
    category: 'appointment',
    isComposite: false
  },
  {
    name: 'appointment_completion_rate',
    description: 'Percentage of scheduled appointments completed',
    dataType: 'percentage',
    category: 'appointment',
    isComposite: true,
    calculationFormula: '(completed_appointments / scheduled_appointments) * 100'
  },

  // Provider Metrics
  {
    name: 'provider_production',
    description: 'Production amount by provider',
    dataType: 'currency',
    category: 'provider',
    isComposite: false,
    unit: 'USD'
  },
  {
    name: 'provider_hours',
    description: 'Hours worked by provider',
    dataType: 'decimal',
    category: 'provider',
    isComposite: false,
    unit: 'hours'
  },
  {
    name: 'production_per_hour',
    description: 'Average production per hour',
    dataType: 'currency',
    category: 'provider',
    isComposite: true,
    calculationFormula: 'provider_production / provider_hours',
    unit: 'USD/hour'
  },

  // Treatment Metrics
  {
    name: 'hygiene_production',
    description: 'Production from hygiene services',
    dataType: 'currency',
    category: 'treatment',
    isComposite: false,
    unit: 'USD'
  },
  {
    name: 'restorative_production',
    description: 'Production from restorative procedures',
    dataType: 'currency',
    category: 'treatment',
    isComposite: false,
    unit: 'USD'
  },
  {
    name: 'treatment_acceptance_rate',
    description: 'Percentage of treatment plans accepted',
    dataType: 'percentage',
    category: 'treatment',
    isComposite: true,
    calculationFormula: '(accepted_treatment_value / presented_treatment_value) * 100'
  }
];

// Common column name variations that map to our standard metrics
export const COLUMN_NAME_MAPPINGS: Record<string, string[]> = {
  daily_production: [
    'production', 'daily production', 'total production', 'prod', 
    'production amount', 'daily prod', 'production total'
  ],
  daily_collection: [
    'collection', 'collections', 'daily collection', 'total collection',
    'collected', 'payments', 'daily collections'
  ],
  new_patients: [
    'new patients', 'new pts', 'new patient', 'np', 'new pt count',
    'new patient count', 'new patients seen'
  ],
  total_patients_seen: [
    'patients seen', 'total patients', 'patient count', 'pts seen',
    'total pts', 'patients', 'patient visits'
  ],
  scheduled_appointments: [
    'scheduled', 'appointments scheduled', 'scheduled appts', 'appts scheduled',
    'total scheduled', 'scheduled appointments'
  ],
  completed_appointments: [
    'completed', 'appointments completed', 'completed appts', 'appts completed',
    'seen', 'appointments seen'
  ],
  cancelled_appointments: [
    'cancelled', 'cancellations', 'cancelled appts', 'canceled',
    'appointment cancellations', 'canceled appointments'
  ],
  no_show_appointments: [
    'no show', 'no-show', 'no shows', 'no-shows', 'ns', 'failed to show'
  ]
};