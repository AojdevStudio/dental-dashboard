# Component Mapping & Analysis

This document provides a summary of the existing UI components in the `src/components` directory. The analysis is based on the file structure and filenames. This is the first step in mapping these components to PRD requirements.

The "Complexity" is inferred from file size and the component's likely responsibilities. "Dependencies" are not fully analyzed but can be assumed (e.g., domain components depend on UI components).

## Component Inventory

### UI Components (`src/components/ui`)

| Component File | Purpose / Description (Inferred) | Complexity (Inferred) |
|---|---|---|
| `accordion.tsx` | A standard accordion component for showing/hiding content panels. | Low |
| `alert.tsx` | Displays various types of alert messages (e.g., info, warning, error). | Low |
| `avatar.tsx` | Renders a user avatar or a placeholder. | Low |
| `badge.tsx` | Displays a small badge or tag. | Low |
| `breadcrumb.tsx` | Provides breadcrumb navigation. | Low |
| `button.tsx` | A standard button component with different variants. | Low |
| `calendar.tsx` | A calendar view for date selection. | Medium |
| `card.tsx` | A card container for content. | Low |
| `checkbox.tsx` | A checkbox input. | Low |
| `command.tsx` | A command palette component (e.g., for search or actions). | Medium |
| `dialog.tsx` | A modal dialog window. | Medium |
| `dropdown-menu.tsx` | A dropdown menu for actions or options. | Medium |
| `form.tsx` | Provides context and helpers for building forms. | Medium |
| `input.tsx` | A standard text input field. | Low |
| `label.tsx` | A label for form inputs. | Low |
| `loading-spinner.tsx` | A spinner to indicate loading status. | Low |
| `popover.tsx` | A popover container. | Low |
| `progress.tsx` | A progress bar. | Low |
| `radio-group.tsx` | A group of radio buttons. | Low |
| `scroll-area.tsx` | A container with customized scrollbars. | Low |
| `select.tsx` | A select/dropdown input. | Medium |
| `separator.tsx` | A visual separator line. | Low |
| `skeleton.tsx` | A placeholder to show while content is loading. | Low |
| `skeleton-loaders.tsx` | A set of more complex skeleton loader patterns. | Medium |
| `table.tsx` | A data table component. | Medium |
| `tabs.tsx` | A tabs component to switch between views. | Low |
| `textarea.tsx` | A textarea input field. | Low |
| `toast.tsx` | Displays toast notifications. | Low |

### Auth Components (`src/components/auth`)

| Component File | Purpose / Description (Inferred) | Complexity (Inferred) |
|---|---|---|
| `auth-guard.tsx` | A component to protect routes that require authentication. | Medium |
| `password-reset-request.tsx` | A form for users to request a password reset link. | Medium |
| `register-form-comprehensive.tsx`| A comprehensive registration form. (High complexity due to size). | High |
| `password-reset-confirm.tsx` | A form for users to set a new password using a reset token. | Medium |

### Common Components (`src/components/common`)

| Component File | Purpose / Description (Inferred) | Complexity (Inferred) |
|---|---|---|
| `clinic-selector.tsx` | A dropdown or control to switch between different clinics. | Medium |
| `dashboard-layout.tsx`| The main layout structure for the dashboard pages. | Medium |
| `date-picker.tsx` | A date picker component, likely wrapping the UI calendar. | Medium |
| `export-button.tsx` | A button to trigger data export functionality. | Low |
| `filters.tsx` | A complex component for filtering data on the dashboard. (High complexity due to size). | High |
| `header.tsx` | The header section of the application. | Low |
| `navigation.tsx` | The main navigation component. | Medium |
| `nav-item.tsx` | A single item within the navigation component. | Low |
| `sidebar.tsx` | The sidebar navigation for the dashboard. | Medium |
| `top-nav.tsx` | The top navigation bar. | Medium |
| `user-dropdown.tsx` | A dropdown menu for user-related actions (e.g., profile, logout). | Low |
| `user-nav.tsx` | Navigation component specific to user settings/actions. | Low |


### Dashboard Components (`src/components/dashboard`)

| Component File | Purpose / Description (Inferred) | Complexity (Inferred) |
|---|---|---|
| `chart-container.tsx` | A wrapper container for chart components. | Low |
| `dashboard-grid.tsx` | A grid layout for arranging dashboard widgets. | Medium |
| `dashboard-layout.tsx` | The layout for the main dashboard view. | Medium |
| `kpi-card.tsx` | A card for displaying a single Key Performance Indicator (KPI). | Medium |
| `kpi-chart.tsx` | A chart specifically for visualizing KPI data. | Medium |
| `metric-card.tsx` | A generic card for displaying a metric. | Medium |
| `metrics-overview.tsx` | A component showing an overview of several metrics. | Medium |

#### Charts (`src/components/dashboard/charts`)

| Component File | Purpose / Description (Inferred) | Complexity (Inferred) |
|---|---|---|
| `area-chart.tsx` | An area chart visualization. | Medium |
| `bar-chart.tsx` | A bar chart visualization. | Medium |
| `line-chart.tsx` | A line chart visualization. | Medium |
| `pie-chart.tsx` | A pie chart visualization. | Medium |

### Goals Components (`src/components/goals`)

| Component File | Purpose / Description (Inferred) | Complexity (Inferred) |
|---|---|---|
| `goal-card.tsx` | A card to display a single goal and its status. | Medium |
| `goal-form.tsx` | A form for creating or editing a goal. | Medium |
| `goal-progress.tsx` | A component to visualize the progress of a goal. | Low |
| `variance-indicator.tsx` | An indicator to show variance from a goal. | Low |

### Providers Components (`src/components/providers`)

| Component File | Purpose / Description (Inferred) | Complexity (Inferred) | Notes |
|---|---|---|---|
| `provider-actions.tsx` | Actions related to a provider. | Low | Empty file |
| `provider-card.tsx` | A card displaying provider information. | Low | Empty file |
| `provider-filters.tsx` | Filters for the provider list. | Low | Empty file |
| `provider-grid.tsx` | A grid to display multiple providers. | Low | Empty file |
| `provider-metrics.tsx` | Metrics specific to a provider. | Low | Empty file | 