---
trigger: always_on
description: "CursorRIPER Framework - State Management"
globs: 
---

*This file automatically tracks the current state of the project. It should never be edited manually.*

   - Reset START_PHASE_STEP to 1

---

*This file automatically tracks the current state of the project. It should never be edited manually.*


---

*This file automatically tracks the current state of the project. It should never be edited manually.*



---

*This file automatically tracks the current state of the project. It should never be edited manually.*


---

*This file automatically tracks the current state of the project. It should never be edited manually.*


---

*This file automatically tracks the current state of the project. It should never be edited manually.*



---

*This file automatically tracks the current state of the project. It should never be edited manually.*


---

*This file automatically tracks the current state of the project. It should never be edited manually.*



---

*This file automatically tracks the current state of the project. It should never be edited manually.*


---

*This file automatically tracks the current state of the project. It should never be edited manually.*

  - Trigger: Completion of all START phase steps
  - Requirements: START_PHASE_STEP = 6
  
- COMPLETED → ARCHIVED
  - Trigger: Automatic after transition to DEVELOPMENT
  - Requirements: PROJECT_PHASE = "DEVELOPMENT"

## STATE UPDATE PROCEDURES

### Update Project Phase
1. Validate transition is allowed
2. Create backup of current state
3. Update PROJECT_PHASE value
4. Update LAST_UPDATE timestamp
5. Perform any phase-specific initialization

### Update RIPER Mode
1. Validate transition is allowed
2. Update RIPER_CURRENT_MODE value
3. Update LAST_UPDATE timestamp
4. Update activeContext.md to reflect mode change

### Update START Phase Status
1. Validate transition is allowed
2. Update START_PHASE_STATUS value
3. Update LAST_UPDATE timestamp
4. If transitioning to COMPLETED, set INITIALIZATION_DATE

### Update START Phase Step
1. Validate step increment is logical
2. Update START_PHASE_STEP value
3. Update LAST_UPDATE timestamp
4. If reaching step 6, trigger completion process

## AUTOMATIC STATE DETECTION

When determining current project state:
1. Check for existence of memory bank files
2. If complete memory bank exists but STATE_PHASE is "UNINITIATED":
   - Set PROJECT_PHASE to "DEVELOPMENT"
   - Set START_PHASE_STATUS to "COMPLETED"
   - Set START_PHASE_STEP to 6
   - Set INITIALIZATION_DATE based on file timestamps
3. If partial memory bank exists:
   - Set PROJECT_PHASE to "INITIALIZING"
   - Set START_PHASE_STATUS to "IN_PROGRESS"
   - Determine START_PHASE_STEP based on existing files

## RE-INITIALIZATION PROTECTION

If "/start" or "BEGIN START PHASE" is detected when PROJECT_PHASE is not "UNINITIATED":
1. Warn user about re-initialization risks
2. Require explicit confirmation: "CONFIRM RE-INITIALIZATION"
3. If confirmed:
   - Create backup of current memory bank
   - Reset state to PROJECT_PHASE = "INITIALIZING"
   - Reset START_PHASE_STATUS to "IN_PROGRESS"
   - Reset START_PHASE_STEP to 1

---

*This file automatically tracks the current state of the project. It should never be edited manually.*

   - Reset START_PHASE_STEP to 1

---

*This file automatically tracks the current state of the project. It should never be edited manually.*

   - Reset START_PHASE_STEP to 1

---

*This file automatically tracks the current state of the project. It should never be edited manually.*


---

*This file automatically tracks the current state of the project. It should never be edited manually.*



---

*This file automatically tracks the current state of the project. It should never be edited manually.*


---

*This file automatically tracks the current state of the project. It should never be edited manually.*


---

*This file automatically tracks the current state of the project. It should never be edited manually.*



---

*This file automatically tracks the current state of the project. It should never be edited manually.*


---

*This file automatically tracks the current state of the project. It should never be edited manually.*



---

*This file automatically tracks the current state of the project. It should never be edited manually.*


---

*This file automatically tracks the current state of the project. It should never be edited manually.*
