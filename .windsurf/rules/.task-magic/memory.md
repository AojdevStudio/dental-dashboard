---
trigger: model_decision
description: This rule explains how the agent should use the memory system to find context of the project
---

# AI Memory System

Whenever you use this rule, start your message with the following:

"Checking Task Magic memory..."

This project utilizes a memory system located in the `memory-bank` directory and also on linear (interact with linear mcp) to store a history of completed, failed, or superseded work, providing valuable context for ongoing development. 

## MEMORY BANK STRUCTURE

The memory bank is organized as:

```
memory-bank/
├── projectbrief.md        # Foundation document defining core requirements and goals
├── systemPatterns.md      # System architecture and key technical decisions
├── techContext.md         # Technologies used and development setup
├── activeContext.md       # Current work focus and next steps
└── progress.md            # What works, what's left to build, and known issues
```

## Structure


### Completed PRDs Archive

*   **`docs/prds/done`

### PRD Structure

*  The  docs/prds folder contains Product Requirements Documents (PRDs) organized by their status in the development lifecycle.

docs/prds/
├── backlog/       # PRDs for features not yet started
│   ├── feature-spec.md            # Detailed feature specifications
│   ├── providers-main-page.md     # Planned providers page feature
│   └── ...
├── doing/         # PRDs for features currently in development
│   ├── prd-mvp.md                 # Current MVP scope definition
│   ├── refactoring-plan.md        # Active refactoring initiative
│   └── ...
├── done/          # PRDs for completed features
│   ├── aoj-30-basic-dashboard-layout.md      # Completed dashboard layout
│   ├── AOJ-44_location_financial_model_prd_updated.md  # Completed financial model
│   ├── AOJ-45-Fix-Typesafety-Issues.md       # Completed typesafety fixes
│   ├── comprehensive-typescript-error-resolution-prd.md # Completed TS error fixes
│   ├── PRD-Fix-Biome-Linting-API-Dashboard.md # Completed linting fixes
│   ├── STAGEWISE_INTEGRATION.md               # Completed dev-tool integration
│   ├── typescript-error-analysis-findings.md  # Completed error analysis
│   └── ...
└── rejected/      # PRDs that were considered but not implemented
    ├── prd.txt    # Original PRD with critique notes
    └── ...

## Directory and File Management

When working with the memory system, the agent should always verify that required directories and files exist before attempting operations:

1. Creation: New PRDs are created and placed in the backlog/ folder
2. Development: When work begins on a feature, its PRD is moved from backlog/ to doing/
3. Completion: When a feature is completed, its PRD is moved from doing/ to done/
4. Documentation: After completion, a summary is written and placed in ~/.claude/completed

## Key PRD Types

- Feature PRDs: Documents like providers-main-page.md that define specific features
- Technical PRDs: Documents like typescript-error-analysis-findings.md that address technical debt
- MVP Scope: prd-mvp.md defines the current Minimum Viable Product scope
- Refactoring Plans: refactoring-plan.md outlines structural code changes

## Purpose and Usage

The memory system serves as the project's historical record of development activity and planning managed by the AI task system.

**When to Consult Memory:**

*   **Understanding Past Implementations & Plans:** Before starting a new task or planning a new feature, consult the memory (`docs/prds/done` & `.claude/completed`) to understand how similar or dependent features were built and planned.
*   **Avoiding Redundancy:** Check if a similar task, requirement, or plan has been addressed previously.
*   **Planning Related Features:** Review past tasks and plans for a feature to inform the planning and task breakdown of new, related features.
*   **Investigating Failed Tasks:** If a task failed previously, reviewing its archived file (including the `error_log` in the YAML) can provide context.
*   **Historical Context of Decisions:** Archived plans provide a snapshot of the project's goals, requirements, and intended direction at a particular point in time.

**How to Consult Memory:**

1.  **Start with the Logs:** Read `docs/prds` and `.claude/completed` to get a chronological overview of archived items. Identify potentially relevant tasks or plans based on their titles, descriptions, and reasons for archival.
2.  **Dive into Archived Files:** If a log entry suggests an item is highly relevant, read the full archived file from its respective directory (`docs/prds/done` or `docs/prds/doing`) to get the complete details.

By leveraging this historical context, the AI can make more informed decisions, maintain consistency, and work more efficiently on the project.