<design_analysis>
Based on the comprehensive project documentation I've reviewed, I can analyze the design requirements for this dental practice analytics dashboard:

**Key Points Summary:**
- **Project Context**: A role-based, responsive dashboard for dental practices with real-time metrics, Google Sheets integration, and multi-tenant architecture
- **User Roles**: Office Manager, Dentist, Front Desk, Admin - each requiring different access levels and interface priorities
- **Technical Stack**: Next.js, Supabase, Prisma, TanStack Query, Recharts, ShadCN UI, Tailwind CSS
- **Compliance Requirements**: HIPAA-compliant data handling for healthcare information
- **Performance Requirements**: Optimized for up to 50 concurrent users with real-time updates

**Design Considerations:**
1. **Professional Medical Aesthetic**: Must convey trust, reliability, and clinical precision appropriate for healthcare
2. **Data-Heavy Interface**: Complex metrics, charts, and tables require clear visual hierarchy and excellent readability
3. **Role-Based Differentiation**: Different user types need distinct but cohesive interface experiences
4. **Accessibility**: Healthcare applications require high accessibility standards
5. **Mobile Responsiveness**: Support for various devices in clinical environments
6. **Data Visualization**: Charts and metrics need to be clear, actionable, and professional

**Potential Design Challenges:**
- Balancing information density with clarity
- Maintaining professional medical appearance while being user-friendly
- Ensuring color accessibility for data visualization
- Creating intuitive navigation for complex multi-level data
- Supporting both light and potentially dark mode for different clinical environments

**Professional Business Context:**
The application serves dental practices with financial, patient, appointment, and performance metrics. The design must inspire confidence in handling sensitive healthcare and financial data while providing actionable insights for practice management.
</design_analysis>

<design_brief>

# Dental Practice Analytics Dashboard - Design Brief

## 1. Color Palette

### Primary Colors
- **Primary Blue**: `#2563eb` (rgb(37, 99, 235)) - Professional, trustworthy, medical-grade appearance
- **Primary Blue Hover**: `#1d4ed8` (rgb(29, 78, 216)) - Interactive states
- **Primary Blue Light**: `#dbeafe` (rgb(219, 234, 254)) - Subtle backgrounds and accents

### Secondary Colors
- **Secondary Slate**: `#475569` (rgb(71, 85, 105)) - Professional text and secondary elements
- **Secondary Gray**: `#6b7280` (rgb(107, 114, 128)) - Metadata and supporting text
- **Light Gray**: `#f8fafc` (rgb(248, 250, 252)) - Page backgrounds and subtle dividers

### Accent Colors
- **Success Green**: `#059669` (rgb(5, 150, 105)) - Goal achievements, positive metrics, completed tasks
- **Warning Amber**: `#d97706` (rgb(217, 119, 6)) - Alerts, pending items, moderate risk indicators
- **Error Red**: `#dc2626` (rgb(220, 38, 38)) - Critical alerts, failed operations, high-risk indicators
- **Info Teal**: `#0891b2` (rgb(8, 145, 178)) - Information callouts, tips, neutral status updates

### Functional Colors
- **Success Background**: `#ecfdf5` (rgb(236, 253, 245)) - Success message backgrounds
- **Warning Background**: `#fffbeb` (rgb(255, 251, 235)) - Warning message backgrounds  
- **Error Background**: `#fef2f2` (rgb(254, 242, 242)) - Error message backgrounds
- **Info Background**: `#f0fdfa` (rgb(240, 253, 250)) - Info message backgrounds

### Background Colors
- **Page Background**: `#ffffff` (rgb(255, 255, 255)) - Main content areas
- **Card Background**: `#ffffff` (rgb(255, 255, 255)) - Content cards and panels
- **Section Background**: `#f8fafc` (rgb(248, 250, 252)) - Page sections and dividers
- **Input Background**: `#ffffff` (rgb(255, 255, 255)) - Form inputs and interactive elements

**Rationale**: The color palette emphasizes trust, professionalism, and medical-grade reliability essential for healthcare applications. Blue as the primary color conveys dependability and is universally recognized in medical contexts. The functional colors provide clear semantic meaning for different types of information and alerts, crucial for quick decision-making in clinical environments.

## 2. Typography

### Font Family
- **Primary**: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Monospace**: `"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace` (for data tables and code)

### Font Weights
- **Light**: 300 - Subtle text, large headings
- **Normal**: 400 - Body text, standard content
- **Medium**: 500 - Emphasis, button text, form labels
- **Semibold**: 600 - Headings, important metrics
- **Bold**: 700 - Main headings, critical information

### Text Styles

#### Headings
- **H1**: `font-size: 2.25rem (36px)`, `font-weight: 700`, `line-height: 1.2`, `color: #1e293b` - Page titles
- **H2**: `font-size: 1.875rem (30px)`, `font-weight: 600`, `line-height: 1.3`, `color: #1e293b` - Section titles
- **H3**: `font-size: 1.5rem (24px)`, `font-weight: 600`, `line-height: 1.4`, `color: #334155` - Subsection titles
- **H4**: `font-size: 1.25rem (20px)`, `font-weight: 500`, `line-height: 1.4`, `color: #475569` - Component titles

#### Body Text
- **Body Large**: `font-size: 1.125rem (18px)`, `font-weight: 400`, `line-height: 1.6`, `color: #334155` - Primary content
- **Body Regular**: `font-size: 1rem (16px)`, `font-weight: 400`, `line-height: 1.5`, `color: #475569` - Standard text
- **Body Small**: `font-size: 0.875rem (14px)`, `font-weight: 400`, `line-height: 1.4`, `color: #6b7280` - Supporting text

#### Special Text
- **Metric Value**: `font-size: 2rem (32px)`, `font-weight: 700`, `line-height: 1.2`, `color: #1e293b` - Key performance indicators
- **Metric Label**: `font-size: 0.75rem (12px)`, `font-weight: 500`, `line-height: 1.4`, `color: #6b7280`, `text-transform: uppercase`, `letter-spacing: 0.05em` - Metric descriptions
- **Table Header**: `font-size: 0.875rem (14px)`, `font-weight: 600`, `line-height: 1.4`, `color: #374151` - Data table headers
- **Button Text**: `font-size: 0.875rem (14px)`, `font-weight: 500`, `line-height: 1.4` - Interactive elements

**Rationale**: Inter provides excellent readability at all sizes and weights, crucial for data-heavy interfaces. The typography scale ensures clear hierarchy while maintaining legibility for complex medical and financial data. The monospace option supports precise data alignment in tables and reports.

## 3. Component Styling

### Buttons

#### Primary Button
- **Background**: `#2563eb`, **Hover**: `#1d4ed8`, **Active**: `#1e40af`
- **Text**: `#ffffff`, `font-weight: 500`, `font-size: 0.875rem`
- **Padding**: `12px 24px`, **Border-radius**: `8px`
- **Border**: `none`, **Box-shadow**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **Transition**: `all 0.15s ease-in-out`

#### Secondary Button
- **Background**: `#ffffff`, **Hover**: `#f8fafc`, **Active**: `#f1f5f9`
- **Text**: `#475569`, `font-weight: 500`, `font-size: 0.875rem`
- **Padding**: `12px 24px`, **Border-radius**: `8px`
- **Border**: `1px solid #d1d5db`, **Box-shadow**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`

#### Destructive Button
- **Background**: `#dc2626`, **Hover**: `#b91c1c`, **Active**: `#991b1b`
- **Text**: `#ffffff`, `font-weight: 500`, `font-size: 0.875rem`
- **Padding**: `12px 24px`, **Border-radius**: `8px`

### Forms and Input Fields

#### Text Input
- **Background**: `#ffffff`, **Border**: `1px solid #d1d5db`
- **Focus Border**: `2px solid #2563eb`, **Focus Ring**: `0 0 0 3px rgba(37, 99, 235, 0.1)`
- **Padding**: `12px 16px`, **Border-radius**: `8px`
- **Font-size**: `1rem`, **Line-height**: `1.5`
- **Placeholder**: `color: #9ca3af`

#### Select Dropdown
- **Background**: `#ffffff`, **Border**: `1px solid #d1d5db`
- **Padding**: `12px 16px`, **Border-radius**: `8px`
- **Icon**: Chevron down in `#6b7280`
- **Hover**: `border-color: #9ca3af`

#### Form Labels
- **Font-size**: `0.875rem`, **Font-weight**: `500`, **Color**: `#374151`
- **Margin-bottom**: `8px`, **Display**: `block`

### Navigation Elements

#### Sidebar Navigation
- **Background**: `#ffffff`, **Border-right**: `1px solid #e5e7eb`
- **Width**: `280px` (desktop), collapsible to `64px`
- **Item Padding**: `12px 16px`, **Border-radius**: `6px`
- **Active Background**: `#eff6ff`, **Active Text**: `#2563eb`, **Active Border-left**: `3px solid #2563eb`
- **Hover Background**: `#f9fafb`

#### Top Navigation
- **Background**: `#ffffff`, **Border-bottom**: `1px solid #e5e7eb`
- **Height**: `64px`, **Padding**: `0 24px`
- **Items**: `font-size: 0.875rem`, `font-weight: 500`, `color: #475569`

### Cards or Content Blocks

#### Metric Card
- **Background**: `#ffffff`, **Border**: `1px solid #e5e7eb`
- **Border-radius**: `12px`, **Padding**: `24px`
- **Box-shadow**: `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)`
- **Hover**: `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`

#### Dashboard Panel
- **Background**: `#ffffff`, **Border**: `1px solid #e5e7eb`
- **Border-radius**: `8px`, **Padding**: `20px`
- **Header**: `border-bottom: 1px solid #f3f4f6`, `padding-bottom: 16px`, `margin-bottom: 20px`

**Rationale**: Component styling prioritizes clarity and professional appearance while maintaining accessibility. The consistent use of border-radius, shadows, and spacing creates a cohesive, modern interface appropriate for healthcare settings. Focus states and hover effects provide clear user feedback essential for efficient data entry and navigation.

## 4. Icons and Imagery

### Icon Style
- **Library**: Lucide React (consistent with ShadCN UI)
- **Style**: Outline/line style for clarity and professional appearance
- **Size Standards**: `16px`, `20px`, `24px`, `32px`
- **Colors**: `#6b7280` (default), `#2563eb` (active/primary), `#dc2626` (destructive/error)
- **Stroke Width**: `1.5px` for balance between clarity and weight

### Common Icon Usage
- **Navigation**: `Home`, `BarChart3`, `Users`, `Settings`, `FileText`, `Goal`
- **Actions**: `Plus`, `Edit`, `Trash2`, `Download`, `Upload`, `RefreshCw`
- **Status**: `CheckCircle`, `AlertTriangle`, `XCircle`, `Info`, `Clock`
- **Data**: `TrendingUp`, `TrendingDown`, `Calendar`, `Filter`, `Search`

### Image Guidelines
- **Profile Images**: `48px` circular avatars with `#f3f4f6` background fallback
- **Clinic Logos**: Maximum `200px` width, maintain aspect ratio
- **Chart Placeholders**: Use subtle grid patterns in `#f8fafc` with `#e5e7eb` lines
- **Empty States**: Minimalist illustrations in brand colors with clear call-to-action

**Rationale**: Lucide icons provide a professional, medical-appropriate aesthetic with excellent clarity at all sizes. The outline style ensures accessibility and readability across different backgrounds while maintaining the clean, trustworthy appearance required for healthcare applications.

## 5. Spacing System

### Grid Layout
- **Base Unit**: `4px` (0.25rem)
- **Container Max Width**: `1440px` with `24px` side padding
- **Grid Columns**: 12-column grid with `24px` gutters
- **Section Spacing**: `64px` vertical between major sections

### Margins and Padding
- **Micro**: `4px` - Fine adjustments, icon spacing
- **Small**: `8px` - Form element spacing, tight layouts
- **Medium**: `16px` - Standard component spacing, button padding
- **Large**: `24px` - Card padding, section spacing
- **XL**: `32px` - Major section padding, large component spacing
- **XXL**: `48px` - Page section spacing, major layout divisions
- **XXXL**: `64px` - Page-level section breaks

### Responsive Breakpoints
- **Mobile**: `320px - 767px` - Single column layouts, full-width components
- **Tablet**: `768px - 1023px` - Two-column layouts, condensed navigation
- **Desktop**: `1024px - 1439px` - Full multi-column layouts
- **Large Desktop**: `1440px+` - Maximum width container with side margins

**Rationale**: The 4px base unit system ensures consistent spacing throughout the application while providing flexibility for different component sizes. The generous spacing supports readability of complex data visualizations and reduces cognitive load when processing multiple metrics simultaneously.

## 6. Motion & Animation

### Transitions
- **Standard Duration**: `150ms` for most UI interactions
- **Medium Duration**: `300ms` for layout changes and reveals
- **Slow Duration**: `500ms` for complex state changes
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` - Smooth, professional feel

### Hover Effects
- **Button Hover**: Background color transition `150ms ease-in-out`
- **Card Hover**: Box-shadow elevation `200ms ease-out`
- **Link Hover**: Color transition `100ms ease-in-out`
- **Icon Hover**: Scale `1.05` with `150ms ease-out`

### Loading Animations
- **Spinner**: Subtle rotating animation in primary blue
- **Skeleton Loading**: Subtle shimmer effect in `#f3f4f6` with `#e5e7eb` highlights
- **Progress Bars**: Smooth width transitions with `300ms ease-out`
- **Chart Loading**: Fade-in animation `400ms ease-out` for data visualizations

**Rationale**: Subtle, professional animations enhance the user experience without distracting from critical healthcare data. The consistent timing and easing create a polished, trustworthy interface that supports efficient workflow in clinical environments.

## 7. Responsive Design Considerations

### Breakpoints
- **Desktop First**: `max-width: 1439px` - Primary desktop experience
- **Large Desktop**: `min-width: 1440px` - Optimal viewing experience with expanded layouts
- **Tablet**: `max-width: 1023px` - Condensed desktop layouts
- **Small Tablet**: `max-width: 767px` - Simplified two-column layouts
- **Mobile**: `max-width: 479px` - Essential features only

### Mobile-specific Adjustments
- **Navigation**: Collapsible bottom navigation or hamburger menu
- **Tables**: Horizontal scroll with sticky first column
- **Charts**: Simplified views with tap-to-expand functionality
- **Forms**: Full-width inputs with larger touch targets (`48px minimum`)
- **Cards**: Single-column stacking with increased padding

### Touch Targets
- **Minimum Size**: `44px x 44px` for all interactive elements
- **Button Spacing**: Minimum `8px` between adjacent touch targets
- **Table Actions**: Larger touch areas for mobile table interactions

**Rationale**: Mobile responsiveness is critical for healthcare professionals who may need to access data on various devices throughout their practice. The design prioritizes essential information and maintains usability across all screen sizes while preserving the professional aesthetic.

## 8. Accessibility Considerations

### Color Contrast
- **Text on White**: Minimum `4.5:1` contrast ratio (AA compliance)
- **Large Text**: Minimum `3:1` contrast ratio for text `18px+` or `14px+ bold`
- **Interactive Elements**: `3:1` contrast ratio for focus indicators and borders
- **Charts**: Colorblind-friendly palette with pattern/texture alternatives

### Text Sizing
- **Minimum Body Text**: `16px` (1rem) for optimal readability
- **Scalable Text**: Support for 200% zoom without horizontal scrolling
- **Line Height**: Minimum `1.5` for body text, `1.2` for headings

### Alternative Text for Images
- **Descriptive Alt Text**: Complete descriptions for all informational images
- **Decorative Images**: `alt=""` for purely decorative elements
- **Chart Descriptions**: Comprehensive data descriptions for screen readers
- **Icon Labels**: Clear text labels or `aria-label` attributes for all icons

### Keyboard Navigation
- **Focus Indicators**: Clear `2px` outline in primary blue with `2px` offset
- **Tab Order**: Logical progression through interactive elements
- **Skip Links**: "Skip to main content" for efficient navigation
- **Keyboard Shortcuts**: Common shortcuts for frequent actions

**Rationale**: Healthcare applications must meet high accessibility standards to ensure all users can effectively access critical medical and financial data. WCAG 2.1 AA compliance is essential for professional medical software and demonstrates commitment to inclusive design.

## Dark Mode Considerations

### Primary Colors (Dark Mode)
- **Background**: `#0f172a` (rgb(15, 23, 42)) - Main dark background
- **Card Background**: `#1e293b` (rgb(30, 41, 59)) - Elevated surfaces
- **Primary Blue**: `#3b82f6` (rgb(59, 130, 246)) - Adjusted for dark backgrounds
- **Text Primary**: `#f8fafc` (rgb(248, 250, 252)) - High contrast text
- **Text Secondary**: `#cbd5e1` (rgb(203, 213, 225)) - Supporting text

### Implementation Notes
Dark mode should be implemented as an optional feature for users who prefer reduced eye strain during extended use. All interactive elements, charts, and data visualizations must maintain the same level of contrast and accessibility in both light and dark modes. The professional medical aesthetic should be preserved while providing a comfortable viewing experience for different lighting conditions.

**Rationale**: This comprehensive design brief establishes a professional, trustworthy, and accessible foundation for the dental practice analytics dashboard. The design system prioritizes clarity, efficiency, and medical-grade reliability while supporting the complex data visualization and multi-role functionality required for effective practice management. The consistent application of these design principles will create a cohesive user experience that instills confidence in healthcare professionals managing critical practice data.

</design_brief>