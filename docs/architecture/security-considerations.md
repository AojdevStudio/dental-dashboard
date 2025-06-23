# Security Considerations

## Overview

This document outlines the comprehensive security architecture and best practices implemented in the Dental Dashboard. It covers authentication, authorization, data protection, compliance requirements, and security monitoring strategies.

## Quick Reference

```typescript
// Security layers
1. Authentication: Supabase Auth with MFA
2. Authorization: Row Level Security (RLS) + RBAC
3. Data Protection: Encryption at rest and in transit
4. API Security: Rate limiting, CORS, input validation
5. Compliance: HIPAA considerations
```

## Authentication Architecture

### Supabase Auth Integration

```typescript
// lib/auth/supabase-client.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce' // Proof Key for Code Exchange
    }
  }
)
```

### Multi-Factor Authentication (MFA)

```typescript
// Enable MFA for sensitive operations
async function enableMFA(userId: string) {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp'
  })
  
  if (error) throw error
  
  // Store recovery codes securely
  await storeRecoveryCodes(userId, data.recoveryCodes)
  
  return {
    qrCode: data.totp.qr_code,
    secret: data.totp.secret
  }
}

// Verify MFA during login
async function verifyMFA(code: string) {
  const { data, error } = await supabase.auth.mfa.verify({
    factorId: mfaFactorId,
    code
  })
  
  if (error) throw new Error('Invalid MFA code')
  
  return data
}
```

### Session Management

```typescript
// Secure session configuration
export const sessionConfig = {
  maxAge: 60 * 60 * 8, // 8 hours
  refreshThreshold: 60 * 15, // Refresh if < 15 minutes
  absoluteTimeout: 60 * 60 * 24, // 24 hours absolute
}

// Session refresh middleware
export async function refreshSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    throw new Error('Session expired')
  }
  
  // Check if refresh needed
  const expiresIn = session.expires_at - Date.now() / 1000
  
  if (expiresIn < sessionConfig.refreshThreshold) {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw error
    return data.session
  }
  
  return session
}
```

### Password Requirements

```typescript
// Password validation schema
const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character')
  .refine(
    (password) => !commonPasswords.includes(password.toLowerCase()),
    'Password is too common'
  )
  .refine(
    (password) => calculateEntropy(password) > 50,
    'Password is not strong enough'
  )

// Password strength calculator
function calculateEntropy(password: string): number {
  const charsets = [
    { regex: /[a-z]/, size: 26 },
    { regex: /[A-Z]/, size: 26 },
    { regex: /[0-9]/, size: 10 },
    { regex: /[^A-Za-z0-9]/, size: 32 }
  ]
  
  const activeCharsets = charsets.filter(cs => cs.regex.test(password))
  const possibleChars = activeCharsets.reduce((sum, cs) => sum + cs.size, 0)
  
  return password.length * Math.log2(possibleChars)
}
```

## Authorization System

### Role-Based Access Control (RBAC)

```typescript
// User roles and permissions
export enum UserRole {
  ADMIN = 'admin',
  OFFICE_MANAGER = 'office_manager',
  PROVIDER = 'provider',
  FRONT_DESK = 'front_desk',
  VIEWER = 'viewer'
}

// Permission definitions
export const permissions = {
  // Clinic management
  'clinic:read': [UserRole.ADMIN, UserRole.OFFICE_MANAGER, UserRole.PROVIDER, UserRole.FRONT_DESK, UserRole.VIEWER],
  'clinic:write': [UserRole.ADMIN],
  'clinic:delete': [UserRole.ADMIN],
  
  // Provider management
  'providers:read': [UserRole.ADMIN, UserRole.OFFICE_MANAGER, UserRole.PROVIDER, UserRole.FRONT_DESK, UserRole.VIEWER],
  'providers:write': [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
  'providers:delete': [UserRole.ADMIN],
  
  // Financial data
  'financials:read': [UserRole.ADMIN, UserRole.OFFICE_MANAGER, UserRole.PROVIDER],
  'financials:write': [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
  'financials:export': [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
  
  // Patient data
  'patients:read': [UserRole.ADMIN, UserRole.OFFICE_MANAGER, UserRole.PROVIDER, UserRole.FRONT_DESK],
  'patients:write': [UserRole.ADMIN, UserRole.OFFICE_MANAGER, UserRole.FRONT_DESK],
  'patients:delete': [UserRole.ADMIN],
  
  // Goals
  'goals:read': [UserRole.ADMIN, UserRole.OFFICE_MANAGER, UserRole.PROVIDER],
  'goals:write': [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
  
  // Reports
  'reports:read': [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
  'reports:export': [UserRole.ADMIN, UserRole.OFFICE_MANAGER]
} as const

// Permission check function
export function hasPermission(
  user: User,
  permission: keyof typeof permissions
): boolean {
  return permissions[permission].includes(user.role as UserRole)
}

// React hook for permissions
export function usePermission(permission: keyof typeof permissions) {
  const { user } = useAuth()
  return user ? hasPermission(user, permission) : false
}
```

### API Route Protection

```typescript
// middleware/withAuth.ts
export function withAuth(
  handler: NextApiHandler,
  options?: {
    requiredPermission?: keyof typeof permissions
    allowedRoles?: UserRole[]
  }
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Verify JWT token
      const token = req.headers.authorization?.replace('Bearer ', '')
      if (!token) {
        return res.status(401).json({ error: 'No token provided' })
      }
      
      // Verify with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' })
      }
      
      // Get user profile with role
      const profile = await getUserProfile(user.id)
      if (!profile) {
        return res.status(401).json({ error: 'User profile not found' })
      }
      
      // Check role-based access
      if (options?.allowedRoles && !options.allowedRoles.includes(profile.role as UserRole)) {
        return res.status(403).json({ error: 'Insufficient role' })
      }
      
      // Check permission-based access
      if (options?.requiredPermission && !hasPermission(profile, options.requiredPermission)) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }
      
      // Attach user to request
      (req as any).user = profile
      
      // Continue to handler
      return handler(req, res)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(500).json({ error: 'Authentication error' })
    }
  }
}

// Usage example
export default withAuth(
  async function handler(req, res) {
    // Handler code
  },
  { requiredPermission: 'providers:write' }
)
```

## Row Level Security (RLS)

### Database-Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Get current user's clinic ID
CREATE OR REPLACE FUNCTION get_current_clinic_id()
RETURNS UUID AS $$
DECLARE
  clinic_id UUID;
BEGIN
  -- Try to get from JWT claims first
  clinic_id := current_setting('request.jwt.claims', true)::json->>'clinic_id';
  
  IF clinic_id IS NOT NULL THEN
    RETURN clinic_id::UUID;
  END IF;
  
  -- Fallback to app context
  clinic_id := current_setting('app.current_clinic_id', true);
  
  IF clinic_id IS NOT NULL THEN
    RETURN clinic_id::UUID;
  END IF;
  
  -- Get from user profile
  SELECT u.clinic_id INTO clinic_id
  FROM users u
  WHERE u.id = auth.uid();
  
  RETURN clinic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Multi-tenant isolation policies
CREATE POLICY "Users can only see their clinic's users"
  ON users FOR ALL
  USING (clinic_id = get_current_clinic_id());

CREATE POLICY "Providers belong to user's clinic"
  ON providers FOR ALL
  USING (clinic_id = get_current_clinic_id());

CREATE POLICY "Patients belong to user's clinic"
  ON patients FOR ALL
  USING (clinic_id = get_current_clinic_id());

-- Financial data access based on role
CREATE POLICY "Financial data restricted by role"
  ON daily_financials FOR SELECT
  USING (
    clinic_id = get_current_clinic_id() AND
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'office_manager', 'provider')
    )
  );

-- Provider-specific data access
CREATE POLICY "Providers see only their data"
  ON appointments FOR SELECT
  USING (
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role IN ('admin', 'office_manager')
      ) THEN clinic_id = get_current_clinic_id()
      ELSE provider_id IN (
        SELECT p.id FROM providers p
        JOIN users u ON u.provider_id = p.id
        WHERE u.id = auth.uid()
      )
    END
  );
```

### Testing RLS Policies

```typescript
// Test multi-tenant isolation
async function testRLSIsolation() {
  // Set up test context for clinic A
  await supabase.rpc('set_config', {
    setting: 'app.current_clinic_id',
    value: clinicA.id
  })
  
  // Should only see clinic A data
  const { data: providersA } = await supabase
    .from('providers')
    .select('*')
  
  assert(providersA.every(p => p.clinic_id === clinicA.id))
  
  // Switch to clinic B context
  await supabase.rpc('set_config', {
    setting: 'app.current_clinic_id',
    value: clinicB.id
  })
  
  // Should only see clinic B data
  const { data: providersB } = await supabase
    .from('providers')
    .select('*')
  
  assert(providersB.every(p => p.clinic_id === clinicB.id))
}
```

## Data Protection

### Encryption at Rest

```typescript
// Sensitive data encryption
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const algorithm = 'aes-256-gcm'
const keyLength = 32
const ivLength = 16
const tagLength = 16
const saltLength = 64
const iterations = 100000

export class EncryptionService {
  private key: Buffer
  
  constructor() {
    this.key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
  }
  
  encrypt(text: string): string {
    const iv = randomBytes(ivLength)
    const cipher = createCipheriv(algorithm, this.key, iv)
    
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ])
    
    const tag = cipher.getAuthTag()
    
    return Buffer.concat([iv, tag, encrypted]).toString('base64')
  }
  
  decrypt(encryptedData: string): string {
    const buffer = Buffer.from(encryptedData, 'base64')
    
    const iv = buffer.slice(0, ivLength)
    const tag = buffer.slice(ivLength, ivLength + tagLength)
    const encrypted = buffer.slice(ivLength + tagLength)
    
    const decipher = createDecipheriv(algorithm, this.key, iv)
    decipher.setAuthTag(tag)
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ])
    
    return decrypted.toString('utf8')
  }
}

// Usage for PII encryption
const encryption = new EncryptionService()

// Encrypt SSN before storage
const encryptedSSN = encryption.encrypt(patient.ssn)

// Decrypt when needed
const decryptedSSN = encryption.decrypt(patient.encryptedSSN)
```

### Data Masking

```typescript
// PII masking utilities
export const maskingUtils = {
  // SSN: XXX-XX-1234
  maskSSN(ssn: string): string {
    if (!ssn || ssn.length < 4) return '***'
    return `***-**-${ssn.slice(-4)}`
  },
  
  // Email: j***@example.com
  maskEmail(email: string): string {
    const [local, domain] = email.split('@')
    if (local.length <= 2) return `**@${domain}`
    return `${local[0]}${'*'.repeat(local.length - 2)}${local.slice(-1)}@${domain}`
  },
  
  // Phone: (***) ***-1234
  maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length < 4) return '***'
    return `(***) ***-${cleaned.slice(-4)}`
  },
  
  // DOB: **/DD/YYYY (show only day for age verification)
  maskDOB(dob: Date): string {
    const day = dob.getDate().toString().padStart(2, '0')
    const year = dob.getFullYear()
    return `**/${day}/${year}`
  }
}

// Apply masking based on user role
export function maskPatientData(patient: Patient, userRole: UserRole): MaskedPatient {
  if (userRole === UserRole.ADMIN) {
    return patient // Admins see full data
  }
  
  return {
    ...patient,
    ssn: patient.ssn ? maskingUtils.maskSSN(patient.ssn) : undefined,
    dateOfBirth: maskingUtils.maskDOB(patient.dateOfBirth),
    email: userRole === UserRole.VIEWER ? maskingUtils.maskEmail(patient.email) : patient.email,
    phoneNumber: userRole === UserRole.VIEWER ? maskingUtils.maskPhone(patient.phoneNumber) : patient.phoneNumber
  }
}
```

## API Security

### Input Validation

```typescript
// Comprehensive input validation
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// SQL injection prevention
const sqlSafeString = z.string().refine(
  (val) => !/['";\\]|(--)|(\/\*)|\*\/|xp_|sp_|DROP|INSERT|UPDATE|DELETE/i.test(val),
  'Invalid characters detected'
)

// XSS prevention
const xssSafeString = z.string().transform((val) => DOMPurify.sanitize(val))

// Common validators
export const validators = {
  // Email with additional checks
  email: z.string()
    .email()
    .toLowerCase()
    .refine(
      (email) => !disposableEmailDomains.includes(email.split('@')[1]),
      'Disposable email addresses not allowed'
    ),
  
  // Phone number validation
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .transform((val) => val.replace(/\D/g, '')),
  
  // UUID validation
  uuid: z.string().uuid(),
  
  // Safe text input
  safeText: sqlSafeString.pipe(xssSafeString),
  
  // Currency (stored as cents)
  currency: z.number()
    .int()
    .min(0)
    .max(999999999), // Max $9,999,999.99
  
  // Date range validation
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).refine(
    (range) => new Date(range.end) > new Date(range.start),
    'End date must be after start date'
  ).refine(
    (range) => {
      const diff = new Date(range.end).getTime() - new Date(range.start).getTime()
      const days = diff / (1000 * 60 * 60 * 24)
      return days <= 365
    },
    'Date range cannot exceed 365 days'
  )
}

// Request validation middleware
export function validateRequest(schema: z.ZodSchema) {
  return async (req: NextApiRequest, res: NextApiResponse, next: Function) => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: (req as any).params
      })
      
      req.body = validated.body || req.body
      req.query = validated.query || req.query
      ;(req as any).params = validated.params || (req as any).params
      
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        })
      }
      throw error
    }
  }
}
```

### Rate Limiting

```typescript
// Rate limiting implementation
import { RateLimiter } from 'limiter'

// Different limits for different operations
const rateLimits = {
  // API endpoints
  api: {
    general: { requests: 100, per: 'minute' },
    auth: { requests: 5, per: 'minute' },
    export: { requests: 10, per: 'hour' },
    import: { requests: 5, per: 'hour' }
  },
  
  // User actions
  user: {
    login: { requests: 5, per: '15 minutes' },
    passwordReset: { requests: 3, per: 'hour' },
    mfaAttempts: { requests: 5, per: '10 minutes' }
  }
}

// Rate limiter middleware
export function rateLimit(
  type: keyof typeof rateLimits.api = 'general'
) {
  const limits = rateLimits.api[type]
  const limiters = new Map<string, RateLimiter>()
  
  return async (req: NextApiRequest, res: NextApiResponse, next: Function) => {
    const identifier = getIdentifier(req)
    
    if (!limiters.has(identifier)) {
      limiters.set(identifier, new RateLimiter({
        tokensPerInterval: limits.requests,
        interval: limits.per,
        fireImmediately: true
      }))
    }
    
    const limiter = limiters.get(identifier)!
    
    if (await limiter.tryRemoveTokens(1)) {
      next()
    } else {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: limiter.getTokensRemaining()
      })
    }
  }
}

// Get identifier for rate limiting
function getIdentifier(req: NextApiRequest): string {
  // Prefer user ID if authenticated
  const userId = (req as any).user?.id
  if (userId) return `user:${userId}`
  
  // Fall back to IP address
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded 
    ? (forwarded as string).split(',')[0] 
    : req.socket.remoteAddress
  
  return `ip:${ip}`
}
```

### CORS Configuration

```typescript
// CORS middleware with security headers
import Cors from 'cors'

const corsOptions: Cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'https://app.dentalcrm.com',
      'https://staging.dentalcrm.com'
    ].filter(Boolean)
    
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
}

// Security headers middleware
export function securityHeaders(req: NextApiRequest, res: NextApiResponse, next: Function) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block')
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.github.com; " +
    "frame-ancestors 'none';"
  )
  
  next()
}
```

## HIPAA Compliance

### Access Controls

```typescript
// HIPAA access logging
interface AccessLog {
  userId: string
  userRole: string
  action: 'view' | 'create' | 'update' | 'delete' | 'export'
  resourceType: 'patient' | 'appointment' | 'financial' | 'clinical'
  resourceId: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  success: boolean
  reason?: string
}

export async function logAccess(log: AccessLog) {
  await supabase.from('hipaa_access_logs').insert({
    ...log,
    timestamp: new Date().toISOString()
  })
}

// Middleware for HIPAA logging
export function withHIPAALogging(
  resourceType: AccessLog['resourceType']
) {
  return (handler: NextApiHandler) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const startTime = Date.now()
      const originalJson = res.json
      
      // Override res.json to capture response
      res.json = function(data: any) {
        const success = res.statusCode < 400
        
        // Log access
        logAccess({
          userId: (req as any).user?.id || 'anonymous',
          userRole: (req as any).user?.role || 'unknown',
          action: getActionFromMethod(req.method!),
          resourceType,
          resourceId: (req.query.id as string) || 'multiple',
          timestamp: new Date(),
          ipAddress: getClientIp(req),
          userAgent: req.headers['user-agent'] || 'unknown',
          success,
          reason: !success ? data.error : undefined
        }).catch(console.error)
        
        return originalJson.call(this, data)
      }
      
      return handler(req, res)
    }
  }
}
```

### Data Retention

```typescript
// HIPAA-compliant data retention policies
export const retentionPolicies = {
  // Medical records: 7 years
  medicalRecords: 7 * 365 * 24 * 60 * 60 * 1000,
  
  // Financial records: 7 years
  financialRecords: 7 * 365 * 24 * 60 * 60 * 1000,
  
  // Access logs: 6 years
  accessLogs: 6 * 365 * 24 * 60 * 60 * 1000,
  
  // Appointment records: 3 years
  appointments: 3 * 365 * 24 * 60 * 60 * 1000,
  
  // Temporary data: 30 days
  temporaryData: 30 * 24 * 60 * 60 * 1000
}

// Automated data purging
export async function purgeExpiredData() {
  const now = new Date()
  
  // Purge old access logs
  await supabase
    .from('hipaa_access_logs')
    .delete()
    .lt('created_at', new Date(now.getTime() - retentionPolicies.accessLogs))
  
  // Archive old medical records
  const expiredRecords = await supabase
    .from('patients')
    .select('*')
    .lt('last_visit_date', new Date(now.getTime() - retentionPolicies.medicalRecords))
    .eq('is_active', false)
  
  if (expiredRecords.data) {
    // Archive to cold storage
    await archiveToS3(expiredRecords.data)
    
    // Remove from active database
    await supabase
      .from('patients')
      .delete()
      .in('id', expiredRecords.data.map(r => r.id))
  }
}
```

## Security Monitoring

### Audit Logging

```typescript
// Comprehensive audit logging
export class AuditLogger {
  static async log(event: {
    action: string
    userId: string
    resourceType: string
    resourceId?: string
    changes?: any
    metadata?: any
  }) {
    const log = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...event,
      ipAddress: await getCurrentIp(),
      userAgent: navigator.userAgent,
      sessionId: getSessionId()
    }
    
    // Store in database
    await supabase.from('audit_logs').insert(log)
    
    // Send to SIEM if configured
    if (process.env.SIEM_ENDPOINT) {
      await fetch(process.env.SIEM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SIEM_API_KEY}`
        },
        body: JSON.stringify(log)
      })
    }
  }
  
  static async logSecurityEvent(event: {
    type: 'login_failure' | 'permission_denied' | 'suspicious_activity' | 'data_breach'
    severity: 'low' | 'medium' | 'high' | 'critical'
    details: any
  }) {
    const log = {
      ...event,
      timestamp: new Date().toISOString(),
      handled: false
    }
    
    // Store security event
    await supabase.from('security_events').insert(log)
    
    // Alert security team for high/critical events
    if (['high', 'critical'].includes(event.severity)) {
      await notifySecurityTeam(log)
    }
  }
}
```

### Intrusion Detection

```typescript
// Anomaly detection patterns
export class SecurityMonitor {
  static async detectAnomalies(userId: string) {
    const recentActivity = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 3600000)) // Last hour
      .order('created_at', { ascending: false })
    
    const anomalies = []
    
    // Rapid API calls
    if (recentActivity.data?.length > 1000) {
      anomalies.push({
        type: 'excessive_api_calls',
        severity: 'medium',
        count: recentActivity.data.length
      })
    }
    
    // Geographic anomaly
    const locations = recentActivity.data?.map(a => a.ip_location)
    if (hasGeographicAnomaly(locations)) {
      anomalies.push({
        type: 'geographic_anomaly',
        severity: 'high',
        locations
      })
    }
    
    // Unusual access patterns
    const accessTimes = recentActivity.data?.map(a => new Date(a.created_at).getHours())
    if (hasTimeAnomaly(accessTimes, userId)) {
      anomalies.push({
        type: 'unusual_access_time',
        severity: 'low',
        times: accessTimes
      })
    }
    
    // Take action on anomalies
    for (const anomaly of anomalies) {
      await AuditLogger.logSecurityEvent({
        type: 'suspicious_activity',
        severity: anomaly.severity,
        details: {
          userId,
          anomaly
        }
      })
      
      // Lock account for high-severity anomalies
      if (anomaly.severity === 'high') {
        await lockUserAccount(userId, 'Security anomaly detected')
      }
    }
    
    return anomalies
  }
}
```

## Incident Response

### Security Incident Procedures

```typescript
// Incident response workflow
export class IncidentResponse {
  static async handleSecurityIncident(incident: {
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    affectedUsers: string[]
    description: string
  }) {
    const incidentId = crypto.randomUUID()
    
    // 1. Log incident
    await supabase.from('security_incidents').insert({
      id: incidentId,
      ...incident,
      status: 'active',
      created_at: new Date().toISOString()
    })
    
    // 2. Immediate containment
    if (incident.severity === 'critical') {
      // Lock affected accounts
      await Promise.all(
        incident.affectedUsers.map(userId => 
          lockUserAccount(userId, `Security incident: ${incidentId}`)
        )
      )
      
      // Revoke active sessions
      await revokeUserSessions(incident.affectedUsers)
      
      // Enable read-only mode if needed
      if (incident.type === 'data_breach') {
        await enableReadOnlyMode()
      }
    }
    
    // 3. Notify stakeholders
    await notifyStakeholders(incident)
    
    // 4. Collect evidence
    await collectForensicData(incidentId)
    
    // 5. Generate incident report
    return generateIncidentReport(incidentId)
  }
  
  static async collectForensicData(incidentId: string) {
    // Snapshot current state
    const snapshot = {
      timestamp: new Date().toISOString(),
      activeUsers: await getActiveUsers(),
      recentLogs: await getRecentAuditLogs(3600000), // Last hour
      systemHealth: await getSystemHealth(),
      databaseMetrics: await getDatabaseMetrics()
    }
    
    // Store forensic data
    await supabase.from('incident_forensics').insert({
      incident_id: incidentId,
      snapshot
    })
  }
}
```

## Security Best Practices

### Development Guidelines

```typescript
// Security checklist for developers
export const securityChecklist = {
  authentication: [
    'Use Supabase Auth for all authentication',
    'Implement MFA for admin accounts',
    'Enforce strong password requirements',
    'Use secure session management',
    'Implement account lockout after failed attempts'
  ],
  
  authorization: [
    'Check permissions on every API route',
    'Use RLS for database queries',
    'Implement least privilege principle',
    'Validate user context in all operations',
    'Log all permission failures'
  ],
  
  dataProtection: [
    'Encrypt PII/PHI at rest',
    'Use TLS 1.2+ for all connections',
    'Mask sensitive data in logs',
    'Implement field-level encryption for SSN/credit cards',
    'Use secure key management'
  ],
  
  inputValidation: [
    'Validate all inputs with Zod schemas',
    'Sanitize HTML content with DOMPurify',
    'Use parameterized queries (via Prisma)',
    'Implement rate limiting',
    'Validate file uploads'
  ],
  
  monitoring: [
    'Log all security events',
    'Monitor for anomalies',
    'Set up alerts for critical events',
    'Regular security audits',
    'Incident response plan'
  ]
}
```

### Regular Security Tasks

```typescript
// Automated security tasks
export const securityTasks = {
  daily: [
    'Review security alerts',
    'Check failed login attempts',
    'Monitor rate limit violations',
    'Verify backup integrity'
  ],
  
  weekly: [
    'Review access logs',
    'Update security rules',
    'Check for unusual patterns',
    'Test incident response'
  ],
  
  monthly: [
    'Security audit',
    'Penetration testing',
    'Review user permissions',
    'Update dependencies',
    'Employee security training'
  ],
  
  quarterly: [
    'Full security assessment',
    'Compliance review',
    'Disaster recovery drill',
    'Third-party security audit'
  ]
}
```

## Related Resources

- [Backend Architecture](./backend-architecture.md) - Security implementation
- [Database Schema](./database-schema.md) - RLS policies
- [External APIs](./external-apis.md) - API security
- [Deployment Guide](./deployment-guide.md) - Production security

---

**Last Updated**: December 2024
**Navigation**: [Back to Architecture Index](./index.md)