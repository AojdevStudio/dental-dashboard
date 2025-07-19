---
allowed-tools: Task, Bash, WebSearch, Read, Grep, TodoWrite
description: Comprehensive multi-perspective PR review for production-ready code
---

# PR Review

Conducts thorough pull request reviews from product, engineering, QA, security, DevOps, and UX perspectives. Handles large PRs (>300 files) gracefully by using file lists and targeted analysis.

**variables:**
PullRequestIdentifier: $ARGUMENTS

**Usage Examples:**

- `/pr-review #123` - Review PR #123
- `/pr-review feature/add-auth` - Review PR by branch name
- `/pr-review https://github.com/owner/repo/pull/456` - Review by full URL

```yaml
pr_review_configuration:
  instructions:
    - step: 1
      action: "Fetch PR details and context"
      details: "Extract PR number/URL from arguments, fetch file list, commit history, CI status, and linked issues. For large PRs, use file list API instead of full diff"
    
    - step: 2
      action: "Handle large PR analysis"
      details: "For PRs with >300 files, clone locally and analyze using git diff with specific file patterns. Focus on critical paths and high-impact changes"
    
    - step: 3
      action: "Conduct Product Manager review"
      details: "Evaluate business value, user impact, strategic alignment, and feature completeness"
    
    - step: 4
      action: "Conduct Developer review"
      details: "Assess code quality, patterns, performance, scalability, and maintainability. For large PRs, sample key files"
    
    - step: 5
      action: "Conduct Quality Engineer review"
      details: "Verify test coverage, edge cases, regression risks, and documentation"
    
    - step: 6
      action: "Conduct Security Engineer review"
      details: "Check authentication, data handling, vulnerabilities, and compliance"
    
    - step: 7
      action: "Conduct DevOps review"
      details: "Evaluate CI/CD compatibility, infrastructure impacts, and monitoring needs"
    
    - step: 8
      action: "Conduct UI/UX review"
      details: "Assess visual consistency, accessibility, user flow, and responsive design"
    
    - step: 9
      action: "Synthesize comprehensive review"
      details: "Compile all findings with priority levels (CRITICAL/HIGH/MEDIUM/LOW) and post to GitHub"

  large_pr_handling:
    detection: "Check file count first using GitHub API"
    strategies:
      - "Use file list API endpoint instead of full diff"
      - "Focus on critical paths: auth, API, database, security"
      - "Sample representative files from each component"
      - "Clone locally for detailed analysis if needed"
    fallback_commands:
      - "gh pr checkout $PullRequestIdentifier"
      - "git diff --name-status origin/main | head -100"
      - "git diff --stat origin/main"
      - "find . -name '*.ts' -o -name '*.tsx' | xargs git diff origin/main -- | head -5000"
  
  context:
    current_state:
      - name: "PR Details"
        command: "!`gh pr view $PullRequestIdentifier --json title,body,author,state,files`"
        description: "Current PR metadata and description"
      
      - name: "PR Files Changed"
        command: "!`gh api repos/:owner/:repo/pulls/$PullRequestIdentifier/files --paginate | jq -r '.[].filename' | head -50 || gh pr view $PullRequestIdentifier --json files --jq '.files[].path' | head -50`"
        description: "List of files changed in the pull request (first 50)"
      
      - name: "PR Diff Summary"
        command: "!`gh pr view $PullRequestIdentifier --json additions,deletions,changedFiles --jq '"Files: \(.changedFiles), +\(.additions), -\(.deletions)"' || echo 'Unable to fetch diff summary'`"
        description: "Summary of changes in the pull request"
      
      - name: "Critical File Changes"
        command: "!`gh api repos/:owner/:repo/pulls/$PullRequestIdentifier/files --paginate | jq -r '.[] | select(.filename | test("(prisma|middleware|auth|api|security|payment)")) | "\(.filename): +\(.additions) -\(.deletions) (\(.status))"' | head -20 || echo 'Run: gh pr checkout $PullRequestIdentifier && git diff --name-status origin/main'`"
        description: "Changes to critical files (security, auth, API, etc.)"
      
      - name: "CI Status"
        command: "!`gh pr checks $PullRequestIdentifier --watch=false || echo 'CI checks completed with failures - see details above'`"
        description: "Current build and test status"
      
      - name: "Related Issues"
        command: "!`gh pr view $PullRequestIdentifier --json closingIssuesReferences`"
        description: "Issues linked to this PR"
    
    input_files:
      - "@CLAUDE.md"
      - "@.github/pull_request_template.md"
    
    reference_docs:
      - "@project-structure.md"
      - "@prisma/schema.prisma"
      - "@docs/architecture.md"
      - "@docs/security-guidelines.md"

  review_criteria:
    product:
      - "Clear business value and immediate ROI"
      - "User experience improvements and delight"
      - "Strategic alignment with product roadmap"
      - "Feature completeness with no deferrals"
    
    engineering:
      - "Code quality, readability, and maintainability"
      - "Performance optimization and scalability"
      - "Adherence to project patterns and standards"
      - "Proper error handling and type safety"
    
    quality:
      - "Comprehensive test coverage (unit/integration/E2E)"
      - "Edge case handling and validation"
      - "No regression risk to existing features"
      - "Complete documentation updates"
    
    security:
      - "Proper authentication and authorization"
      - "Input validation and data sanitization"
      - "Sensitive data protection and encryption"
      - "Compliance with security standards"
    
    devops:
      - "CI/CD pipeline compatibility"
      - "Environment configuration correctness"
      - "Monitoring and observability setup"
      - "Zero-downtime deployment capability"
    
    design:
      - "Visual consistency with design system"
      - "WCAG accessibility compliance"
      - "Intuitive user flow and interactions"
      - "Responsive design across devices"

  priority_framework:
    levels:
      CRITICAL: "Blocks merge - must fix immediately"
      HIGH: "Should fix before merge"
      MEDIUM: "Address in this PR if possible"
      LOW: "Consider for future improvements"
    
    immediate_action_policy:
      - "All CRITICAL issues must be resolved"
      - "HIGH priority items fixed before merge"
      - "No deferring user-facing improvements"
      - "Security vulnerabilities fixed immediately"
      - "Performance regressions resolved now"
```