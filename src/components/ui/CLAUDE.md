# Shadcn/UI Component Installation Workflow

**Core Requirement:** Before installing any new shadcn/ui component, and after successfully installing it, you MUST interact with the @shadcn-component-tracking.md file.

## Pre-Installation Steps:

1.  **Consult Tracking File:**
    *   You MUST first read and review the @shadcn-component-tracking.md file.
    *   This file is also referenced in the @shadcn-component-tracking.mdc rule.
    *   Verify if the component you intend to install is already listed and marked as installed (✅).

2.  **Decision Point:**
    *   **If Already Installed (✅):** DO NOT proceed with the installation. Inform the user that the component is already available.
    *   **If Not Installed (❌) or Not Listed:** Proceed to the installation steps.

## Installation Steps:

1.  **Refer to UI Guidelines:**
    *   Follow the installation instructions and best practices outlined in the @ui-components.mdc rule, specifically the `pnpm dlx shadcn@latest add COMPONENT` command.

2.  **Execute Installation:**
    *   Run the appropriate installation command for the desired component.

## Post-Installation Steps:

1.  **Update Tracking File:**
    *   After a component has been successfully installed, you MUST edit the @shadcn-component-tracking.md file.
    *   Update the entry for the newly installed component by changing its status from ❌ to ✅.
    *   If the component was not previously listed, add a new row for it and mark it as ✅.

2.  **Confirmation:**
    *   Inform the user that the component has been installed and the tracking file has been updated.

## Example Workflow:

**User Request:** "Install the `alert` component."

**AI Actions:**

1.  Read @shadcn-component-tracking.md.
2.  Find the `alert` component entry: `| alert           | ❌        | pnpm dlx shadcn@latest add alert | System notifications |`
3.  Determine it's not installed.
4.  Execute `pnpm dlx shadcn@latest add alert`.
5.  After successful installation, edit @shadcn-component-tracking.md to change the line to: `| alert           | ✅        | pnpm dlx shadcn@latest add alert | System notifications |`
6.  Inform the user: "The `alert` component has been installed and `shadcn-component-tracking.md` has been updated."

By following this workflow, we ensure that component installations are always synchronized with our tracking documentation, preventing redundant installations and maintaining a clear overview of available UI elements.
