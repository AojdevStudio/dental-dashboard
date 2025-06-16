Based on the database schema analysis, here's how the user registration form should be designed for this dental practice analytics system:

## Registration Form Fields

### **Core User Information**
```typescript
// Required Fields
- Email Address (email validation)
- Password (minimum 8 characters, complexity requirements)
- Confirm Password
- Full Name
- Phone Number (optional, for SMS notifications)

// Role Selection
- Role: Dropdown with options
  - Admin
  - Office Manager  
  - Dentist
  - Front Desk
```

### **Clinic Association**
```typescript
// Clinic Selection (Multi-select for multi-clinic users)
- Primary Clinic: Dropdown of available clinics (Kam Dental Baytown, Kam Dental Humble)
- Additional Clinics: Multi-select (optional)
- Clinic Registration Code: Text input (for joining existing clinics) - we would have to devise a way to generate and manage these codes

// OR Create New Clinic (for first-time practice setup)
- Clinic Name
- Clinic Location/Address
- Practice Type (General, Orthodontics, etc.)
```

### **Provider-Specific Fields** (Conditional - only show if role is "Dentist")
```typescript
- License Number (optional)
- Specialties: Multi-select checkboxes
- Provider Type: Dropdown (Dentist, Hygienist, Specialist)
- Employment Status: Dropdown (Full-time, Part-time, Associate)
```

### **Additional Information**
```typescript
- Terms of Service: Checkbox (required)
- Privacy Policy: Checkbox (required)
- Marketing Communications: Checkbox (optional)
- Time Zone: Auto-detected or dropdown
```

## Database Write Process

The registration process should write to multiple tables in a specific order:

### **1. Supabase Auth (auth.users)**
```sql
-- Handled automatically by Supabase Auth
INSERT INTO auth.users (
  email,
  encrypted_password,
  phone,
  raw_user_meta_data,
  raw_app_meta_data
) VALUES (
  user_email,
  hashed_password,
  user_phone,
  '{"full_name": "John Doe", "role": "dentist"}',
  '{"clinic_association": "pending", "onboarding_complete": false}'
);
```

### **2. Public Users Table (public.users)**
```sql
INSERT INTO public.users (
  id,
  email,
  name,
  role,
  clinic_id,
  auth_id,
  uuid_id,
  created_at,
  updated_at
) VALUES (
  generate_random_id(),
  user_email,
  full_name,
  primary_role,
  primary_clinic_id,
  auth_user_id, -- from step 1
  auth_user_id, -- UUID from auth.users
  NOW(),
  NOW()
);
```

### **3. User Clinic Roles (public.user_clinic_roles)**
```sql
-- Insert role for primary clinic
INSERT INTO public.user_clinic_roles (
  id,
  user_id,
  clinic_id,
  role,
  is_active,
  created_by,
  created_at,
  updated_at
) VALUES (
  generate_random_id(),
  public_user_id, -- from step 2
  primary_clinic_id,
  user_role,
  true,
  'system', -- or admin_user_id if invited
  NOW(),
  NOW()
);

-- Insert additional clinic roles if any
-- (Repeat for each additional clinic)
```

### **4. Providers Table (public.providers)** - Only if role is "Dentist"
```sql
INSERT INTO public.providers (
  id,
  name,
  provider_type,
  status,
  clinic_id,
  created_at,
  updated_at
) VALUES (
  generate_random_id(),
  full_name,
  'dentist', -- or other provider type
  'active',
  primary_clinic_id,
  NOW(),
  NOW()
);
```

### **5. Create New Clinic (public.clinics)** - Only if creating new clinic
```sql
INSERT INTO public.clinics (
  id,
  name,
  location,
  status,
  uuid_id,
  is_default,
  created_at,
  updated_at
) VALUES (
  generate_random_id(),
  clinic_name,
  clinic_location,
  'active',
  generate_uuid(),
  true, -- first clinic for this user
  NOW(),
  NOW()
);
```

## Registration Flow Implementation

### **Frontend Form Component**
```typescript
interface RegistrationForm {
  // Core fields
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone?: string;
  
  // Role and clinic
  role: 'admin' | 'office_manager' | 'dentist' | 'front_desk';
  primaryClinicId?: string;
  additionalClinicIds?: string[];
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
```

### **API Route Handler**
```typescript
// /api/auth/register
export async function POST(request: Request) {
  const data: RegistrationForm = await request.json();
  
  try {
    // 1. Create Supabase Auth user
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: data.role,
          phone: data.phone
        }
      }
    });
    
    if (authError) throw authError;
    
    // 2. Create clinic if needed
    let clinicId = data.primaryClinicId;
    if (data.newClinic) {
      clinicId = await createClinic(data.newClinic);
    }
    
    // 3. Create public user profile
    const publicUser = await createPublicUser({
      authId: authUser.user.id,
      email: data.email,
      name: data.fullName,
      role: data.role,
      clinicId: clinicId
    });
    
    // 4. Create clinic role associations
    await createUserClinicRole({
      userId: publicUser.id,
      clinicId: clinicId,
      role: data.role,
      isActive: true
    });
    
    // 5. Create provider record if needed
    if (data.role === 'dentist' && data.providerInfo) {
      await createProvider({
        name: data.fullName,
        providerType: data.providerInfo.providerType,
        clinicId: clinicId,
        ...data.providerInfo
      });
    }
    
    // 6. Send verification email
    // (handled automatically by Supabase)
    
    return Response.json({ 
      success: true, 
      message: "Registration successful. Please check your email to verify your account." 
    });
    
  } catch (error) {
    // Rollback any created records
    await handleRegistrationRollback(authUser?.user?.id);
    
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 400 });
  }
}
```

### **Key Considerations**

1. **Transaction Safety**: Use database transactions to ensure all tables are updated together or rolled back on failure.

2. **Email Verification**: Supabase handles email verification automatically. Users can't access the app until verified.

3. **Clinic Codes**: For joining existing clinics, implement a secure registration code system.

4. **Role Validation**: Ensure roles are validated against allowed roles for the clinic.

5. **Multi-tenant Security**: Implement proper RLS policies to ensure data isolation.

6. **Invitation Flow**: Support for admin-invited users vs. self-registration.

This design ensures proper multi-tenant data isolation while maintaining the flexibility for users to belong to multiple clinics with different roles in each.