# Tasks: Ham Radio Study Site

**Input**: Design documents from `/specs/001-i-m-building/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: app/, components/, lib/, public/
- Paths based on plan.md structure

## Phase 3.1: Setup
- [x] T001 Initialize Next.js 15.5 project with TypeScript and Tailwind CSS
- [x] T002 Create project structure (app/, components/, lib/, public/data/)
- [x] T003 Configure ESLint and Prettier

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test for data loading in __tests__/contracts/test-data-loading.test.ts
- [x] T005 [P] Integration test for question browsing in __tests__/integration/test-browse.test.tsx
- [x] T006 [P] Integration test for exam simulation in __tests__/integration/test-exam.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T007 [P] Create types in lib/types.ts
- [x] T008 Implement data loading in lib/data.ts
- [x] T009 [P] Create QuestionCard component in components/QuestionCard.tsx
- [x] T010 [P] Create ExamTimer component in components/ExamTimer.tsx
- [ ] T011 Create home page in app/page.tsx
- [ ] T012 Create browse page in app/browse/[category]/page.tsx
- [ ] T013 Create exam page in app/exam/[category]/page.tsx
- [ ] T014 Create API route for data in app/api/data/route.ts

## Phase 3.4: Integration
- [x] T015 Connect data loading to API route

## Phase 3.5: Polish
- [x] T016 [P] Unit tests for components in __tests__/unit/
- [x] T017 Update README.md with quickstart
- [ ] T018 Run quickstart validation

## Dependencies
- Tests (T004-T006) before implementation (T007-T014)
- T007 blocks T008
- T008 blocks T014, T015
- Implementation before polish (T016-T018)

## Parallel Example
```
# Launch T004-T006 together:
Task: "Contract test for data loading in __tests__/contracts/test-data-loading.test.ts"
Task: "Integration test for question browsing in __tests__/integration/test-browse.test.tsx"
Task: "Integration test for exam simulation in __tests__/integration/test-exam.test.tsx"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task

2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks

3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task</content>
<parameter name="filePath">C:\Users\jcalado\code\hamradiostudy\specs\001-i-m-building\tasks.md