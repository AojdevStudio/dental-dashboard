**ACT AGENTIC**

Think deeply about this task: you are about to embark on a sophisticated TDD-like process that converts a PRD into implementation **tasks ➜ fail‑first unit tests ➜ production code** using three sub‑agents running in a controlled, red/green loop.

**Variables:**

prd_file: $ARGUMENTS
task_output_dir: $ARGUMENTS

**ARGUMENTS PARSING:**
Parse the following arguments from "$ARGUMENTS":
1. `prd_file`: The path to the PRD file to work on.
2. `task_output_dir`: Directory where tasks will be saved.

**PHASE 1: PRD ANALYSIS**
1. Read and deeply understand the specifications at `prd_file`. This file defines:
- The features to implement
- The technical requirements
- The expected output
- The expected behavior
- The expected user experience
- The expected performance
- The expected security
- The expected scalability
- The expected maintainability
- Any specific parameters or constraints.
2. Create a concist JSON summary (key features, non-functional requirements, edge-cases, etc.) of the PRD. Rationale: both downstream agents wget a lightweight, canonical view of the PRD. 


**PHASE 2: OUTPUT DIRECTORY RECONNAISSANCE** 
Thoroughly analyze the `task_output_dir` to understand the current state:
- List all existing files and their naming patterns (if any) 

**PHASE 3: PARALLEL AGENT COORDINATION**
Deploy multiple Sub Agents to generate iterations in parallel for maximum efficiency and creative diversity:

**PHASE 4: AGENT ORCHESTRATION**
 1. Task-Planning Agent: Decompose PRD into atomic implmentation tasks, ordered by dependency; attach acceptance criteria & "definition of done".
 - Output file pattern: `{prd_name}_{task_slug}.md`
 2. Test-Writer Agent: For each task file, use zen to generate a failing-first unit test via testgen; ensure it covers edge-cases & acceptance criteria.
 - Output file pattern: follows testing rules found in .cursor/rules/.structure/testing.mdc

 Both agents run in parallel batches so Task-Planning stays less than or equal to 1 iteration ahead of Test-Writer.

**PHASE 5: Detailed Agent specs**
1. Task-Planning Agent:
TASK: plan tasks for PRD ‹name›  
INPUT: prd_summary.json  
OUTPUT: one markdown task file per feature  
RULES:  
  - each task file must expose:
      title, description, dependencies, acceptance_criteria  
  - stay idempotent – overwrite only if definition changed  
2. Test-Writer Agent:
TASK: write unit tests for ‹task_slug›  
INPUT: corresponding task file (markdown)  
TOOL: zen!testgen   # invokes Zen MCP “testgen” tool  
OUTPUT: colacated next to tested files (e.g., calculations.ts --> calculations.test.ts)
RULES:  
  - cover every acceptance criterion  
  - include edge-case parametrisations suggested by testgen  
  - must be runnable by `vite test`

**PHASE 6: Verification Gate**
1. After Test-Writer Agent has completed, the orchestrator runs `vite test` to verify that all tests pass.
2.Only when tests fail does coding proceed; the failure acts as the red/green signal for a later Code-Writer (not shown) to implement production code until tests pass.

**PHASE 7: Code-Writer Agent**
1. Code-Writer Agent: For each task file, implement the production code to pass the tests.
 - Output file pattern: follows coding rules found in .cursor/rules/.structure/coding.mdc

**PHASE 8: Execution Loop**
1. For each task in pending_tasks:
    - spawn(TaskPlanner, task)          # batch size 1-N
    - wait_for(planner_done)
    - spawn(TestWriter, task)           # uses zen!testgen
    - wait_for(tests_written)
    - result = run_pytest(task.slug)
    - if result.passed:
        - mark_ready_for_code(task)
    - else:
        - log_failure(task, result)

**PHASE 9: Final Report**
1. After all tasks are completed, the orchestrator generates a final report with the following information:
   - Total tasks completed
   - Total tasks failed
   - Total tasks passed
   - Total tasks pending
   - Total tasks in progress
   - Total tasks completed successfully
2. The report is saved to the .claude/completed directory, in the format of a pull request.