# Style Guide

## Color Palette

- **Theme:** Dark Mode
- **Accent Color:** Purple (#A855F7 or similar)
- **Usage:** Accent is used for highlights, buttons, toggles, and primary CTAs

## Typography

- **Font Stack:** System UI or Inter/Roboto
- **Hierarchy:**
  - H1 – 32–40px, bold
  - H2 – 24–28px, semibold
  - Body – 14–16px, normal
  - Captions – 12–14px, light or italic
- **Spacing:** Apply consistent vertical rhythm between headings and text blocks

## Layout & Components

- **Structure:** Clean card-based layout
- **Padding:** 16–24px internal spacing per card
- **Grid System:** 12-column layout or flexbox-based, depending on screen size
- **Component Style:** Rounded corners (8px), subtle drop shadows, clean borders

## Animation & Motion

- **Use Case:** Only for transitions between views or within interactive components
- **Style:** Fast (150–300ms), ease-in-out timing
- **Effect:** Fade-ins, slide-ups, or subtle scale transitions

## Feedback & System Status

- **Loading States:** Skeleton loaders or animated spinners (non-blocking)
- **Success/Failure:** Use color-coded toasts/snackbars with icons
- **Form Feedback:** Inline error messages, outlined fields with red/yellow indicators

## Accessibility

- **Contrast Ratio:** Minimum 4.5:1 for body text, 3:1 for large text
- **Keyboard Navigation:** All interactive elements must be reachable via tab
- **Focus Indicators:** Clear and consistent across components

## Responsiveness

- **Breakpoints:** 
  - Mobile: ≤640px
  - Tablet: 641–1024px
  - Desktop: >1024px
- **Adaptation:** Stack layouts on mobile, use horizontal grouping on desktop