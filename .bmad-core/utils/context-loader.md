# Context Loader Utility

## Purpose
Dynamic context loading utility for BMAD agents to optimize context window usage through selective file loading based on current task context.

## Commands

### Core Loading Commands
- `*load-core` - Load only essential core files (1,844 tokens)
- `*load-all` - Load all files (legacy behavior, 10,104 tokens)
- `*load-status` - Show current context loading status

### Context-Specific Loading
- `*load-planning` - Load planning context files (4,724 additional tokens)
- `*load-coding` - Load coding standards (2,088 additional tokens)
- `*load-agentic` - Load agentic TDD files (200 additional tokens)
- `*load-wave1` - Load wave 1 planning files (340 additional tokens)
- `*load-wave2` - Load wave 2 testing files (428 additional tokens)
- `*load-wave3` - Load wave 3 coding files (480 additional tokens)

### Combination Loading
- `*load-dev` - Load core + coding context (3,932 tokens)
- `*load-pm` - Load core + planning context (6,568 tokens)
- `*load-agentic-full` - Load all agentic workflow files (1,448 additional tokens)

## Implementation Instructions

### For BMAD Master Agent
When user requests context loading:

1. **Parse command** - Extract loading type from user request
2. **Calculate tokens** - Estimate context consumption
3. **Confirm loading** - Show what will be loaded and token cost
4. **Load files** - Use appropriate file paths from config
5. **Provide feedback** - Confirm successful loading

### Context Loading Logic
```yaml
core_files:
  - docs/architecture/tech-stack.md
  - docs/bmad-integration/dev-agent-context.md

context_files:
  planning:
    - docs/prd/dental-dashboard-mvp-completion-brownfield-prd.md
    - docs/architecture/bmad-brownfield-integration-plan.md
  coding:
    - docs/architecture/coding-standards.md
  agentic:
    - docs/bmad-integration/agentic-tdd-integration.md
    - .claude/commands/agentic/init-agentic-tdd.md
  agentic-wave1:
    - .claude/commands/agentic/wave1-task-planning.md
  agentic-wave2:
    - .claude/commands/agentic/wave2-test-writing.md
  agentic-wave3:
    - .claude/commands/agentic/wave3-code-writing.md
```

## Token Consumption Guide

### Optimization Levels
- **Minimal (Core Only)**: 1,844 tokens (0.9% of 200K)
- **Development**: 3,932 tokens (2.0% of 200K)
- **Planning**: 6,568 tokens (3.3% of 200K)
- **Full Agentic**: 8,016 tokens (4.0% of 200K)
- **Legacy (All Files)**: 10,104 tokens (5.1% of 200K)

### Recommended Usage
- **Start with core** - Always load core files first
- **Add context as needed** - Load specific context for current task
- **Monitor consumption** - Track token usage to avoid overload
- **Unload when done** - Clear context when switching tasks

## Error Handling
- **Missing files** - Skip missing files, warn user
- **Token limits** - Warn if approaching context limits
- **Failed loads** - Provide clear error messages
- **Fallback** - Default to core files if specific context fails

## Integration with BMAD Master
Add these commands to the BMAD master agent's command list:
```yaml
commands:
  # ... existing commands ...
  - load-core: Load essential context only
  - load-dev: Load core + coding context  
  - load-pm: Load core + planning context
  - load-agentic: Load agentic workflow context
  - load-all: Load all available context (legacy)
  - load-status: Show current context status
```

## Benefits
- **82% reduction** in default context loading (from 10,104 to 1,844 tokens)
- **Flexible scaling** - Load only what's needed for current task
- **Better performance** - Faster initial load times
- **Context awareness** - Match loading to task requirements
- **Backward compatibility** - Legacy behavior available via `*load-all` 