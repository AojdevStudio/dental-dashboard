# Wave 1: Task Planning Agent

Decompose PRD into atomic implementation tasks using systematic analysis.

## Variables
PRD_FILE: $ARGUMENTS

**FRESH SESSION NOTICE**
This wave should start with a FRESH Claude Code session to ensure optimal context management.

**PHASE 1: ENTER PLAN MODE & MCP SETUP**

FIRST, enter plan mode to build comprehensive context:
- Use `Shift+Tab Shift+Tab` to enter plan mode
- VERIFY MCP availability: TEST "use context7" and "use zen" commands
- UPDATE `shared/coordination/mcp-status.json` with availability status
- READ and deeply analyze the PRD file: `PRD_FILE`
- UNDERSTAND the feature requirements, technical constraints, user experience goals
- ANALYZE the current codebase structure and existing patterns  
- IDENTIFY dependencies, edge cases, and integration points
- BUILD complete mental model before proceeding

**PHASE 2: PRD DISTILLATION**

CREATE comprehensive PRD summary at `shared/artifacts/prd-summary.json`:
```json
{
  "feature_name": "extracted from PRD",
  "core_requirements": ["req1", "req2", "req3"],
  "technical_constraints": ["constraint1", "constraint2"],
  "user_experience_goals": ["ux1", "ux2"],
  "performance_requirements": ["perf1", "perf2"],
  "security_considerations": ["sec1", "sec2"],
  "edge_cases": ["edge1", "edge2"],
  "integration_points": ["integration1", "integration2"],
  "success_criteria": ["criteria1", "criteria2"]
}
```

**PHASE 3: TASK DECOMPOSITION**

For each core requirement, CREATE atomic task file in `shared/artifacts/tasks/`:

File pattern: `{feature_name}_{task_slug}.md`

Each task file MUST contain:
```markdown
# Task: {Title}

## Description
Detailed description of what needs to be implemented

## Dependencies
- List of other tasks that must complete first
- External dependencies (APIs, libraries, etc.)

## Acceptance Criteria
- [ ] Specific, testable criterion 1
- [ ] Specific, testable criterion 2  
- [ ] Specific, testable criterion 3

## Technical Requirements
- Implementation approach
- Performance constraints
- Security considerations

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Code review completed
- [ ] Documentation updated

## Test Scenarios
Detailed scenarios that Test Writer should cover:
- Happy path scenarios
- Edge cases to test
- Error conditions to handle
- Performance test cases

## Implementation Notes
- Suggested approach
- Code patterns to follow
- Files to modify/create
- Potential gotchas
```

**PHASE 4: DEPENDENCY ORDERING**

CREATE `shared/artifacts/tasks/task-dependency-order.json`:
```json
{
  "execution_order": [
    {
      "phase": 1,
      "tasks": ["task1", "task2"],
      "description": "Foundation tasks with no dependencies"
    },
    {
      "phase": 2, 
      "tasks": ["task3", "task4"],
      "description": "Tasks depending on phase 1"
    }
  ],
  "critical_path": ["task1", "task3", "task5"],
  "parallel_opportunities": [
    ["task2", "task4"]
  ]
}
```

**PHASE 5: HANDOFF PREPARATION & CONTEXT MANAGEMENT**

UPDATE coordination files:
- SET `shared/coordination/wave-status.json` current_wave to 1
- SET `shared/coordination/handoff-signals.json` task_planning_complete to true
- CREATE `shared/coordination/wave1-handoff.md` with:
  - Summary of tasks created
  - Key insights for Test Writer
  - Critical dependencies to watch
  - Recommended test approaches
  - MCP recommendations for next wave

PREPARE for fresh session handoff:
- RUN `/compact preserve task breakdown, dependency order, and key architectural decisions`
- DOCUMENT essential context in shared artifacts (not conversation history)
- ENSURE all deliverables are in shared/ directory for next session

**PHASE 6: VERIFICATION & NEXT STEPS**

VERIFY deliverables:
- COUNT task files created
- VALIDATE each task has all required sections
- CHECK dependency ordering makes sense
- CONFIRM PRD summary captures all requirements

OUTPUT completion message:
```
✅ Wave 1 Complete: Task Planning
📋 Created {X} atomic tasks
🔗 Dependency order established
📄 PRD distilled to JSON summary
🧹 Context compacted for handoff

⚠️  CRITICAL: Start Wave 2 with FRESH SESSION
cd ../wave2-test-writing
claude  # NEW session - do not continue this one!
/project:wave2-test-writing
```