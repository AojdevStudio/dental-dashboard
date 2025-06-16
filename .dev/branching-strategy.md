# Branching Strategy for MVP Structure Refactoring

## Branch Structure

- **Main Development Branch**: `main`
- **Primary Feature Branch**: `refactor`
- **Sub-branches**: Optional for each major incremental step, following the naming convention: `refactor-component-name`

## Pull Request Strategy

### For Sub-branches (if used)

1. **Creation**: Create sub-branches directly from the main feature branch
   ```bash
   git checkout refactor
   git checkout -b refactor-app-directory
   git push --set-upstream origin refactor-app-directory
   ```

2. **Development Workflow**:
   - Make focused, incremental changes in the sub-branch
   - Commit regularly with descriptive messages
   - Push changes to remote regularly for backup and visibility
   ```bash
   git push origin refactor-app-directory
   ```

3. **Pull Request Process**:
   - When a sub-branch's work is complete, create a pull request targeting the main feature branch (`refactor`)
   - Use a descriptive title that clearly identifies the component/area refactored
   - Include in the PR description:
     - Summary of changes made
     - List of refactored files
     - Any technical considerations or challenges
     - Testing performed
   - Request review from team members if applicable

4. **Merging**:
   - After approval, merge the sub-branch PR into `refactor`
   - Use a standard merge (not squash) to preserve the commit history
   - Delete the sub-branch after successful merge

### For the Main Feature Branch

1. **Final Testing**:
   - Once all refactoring steps are complete and the main feature branch contains all changes
   - Perform thorough testing on the `refactor` branch
   - Run all tests and verify the application functions correctly
   - Check for any regression issues or conflicts

2. **Main PR Process**:
   - Create a pull request from `refactor` to the main development branch (`main`)
   - Use a comprehensive PR title that indicates the complete refactoring
   - Include in the PR description:
     - Overview of all major changes
     - Link to the refactoring plan documentation
     - Summary of testing performed
     - Any known issues or limitations

3. **Review and Merge**:
   - Request a thorough review of the PR
   - Address any feedback or issues raised during review
   - When approved, merge using a standard merge (not squash) to preserve the full history
   - After successful merge and verification, the feature branch can be deleted

## Code Review Checklist

For all PRs, reviewers should check:

- Code follows the new structure as defined in `.dev/file-system.md`
- All imports are correctly updated
- No duplicated code or files
- Application builds successfully
- Tests pass
- No regression in functionality

## Issue Management

Link related issues to PRs using GitHub's linking syntax in PR descriptions or commit messages:
- "Fixes #123" 
- "Resolves #123"
- "Relates to #123"

# App directory
git checkout refactor
git checkout -b refactor-app-directory
git push --set-upstream origin refactor-app-directory

# Components directory
git checkout refactor
git checkout -b refactor-components-directory
git push --set-upstream origin refactor-components-directory

# Lib directory
git checkout refactor
git checkout -b refactor-lib-directory
git push --set-upstream origin refactor-lib-directory

# Aux directories
git checkout refactor
git checkout -b refactor-aux-directories
git push --set-upstream origin refactor-aux-directories

# Actions and services
git checkout refactor
git checkout -b refactor-actions-services
git push --set-upstream origin refactor-actions-services 