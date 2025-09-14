# Implementation Plan: Ham Radio Study Site

**Branch**: `001-i-m-building` | **Date**: 2025-09-14 | **Spec**: C:\Users\jcalado\code\hamradiostudy\specs\001-i-m-building\spec.md
**Input**: Feature specification from /specs/001-i-m-building/spec.md

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Modern ham radio study site for Portugal categories 3, 2, 1 with Q&A browsing and timed exam simulation. Built with Next.js 15.5, data loaded from JSON files, responsive design.

## Technical Context
**Language/Version**: TypeScript/JavaScript (Next.js 15.5)  
**Primary Dependencies**: Next.js 15.5, React 18+, Tailwind CSS  
**Storage**: JSON files (no database)  
**Testing**: Jest + React Testing Library  
**Target Platform**: Web browsers (responsive)  
**Project Type**: Web application (frontend only)  
**Performance Goals**: Fast loading, smooth interactions  
**Constraints**: No databases, data from predetermined JSON structure, responsive design  
**Scale/Scope**: Small site with 3 categories, static data

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (Next.js web app)
- Using framework directly? Yes
- Single data model? Yes (JSON)
- Avoiding patterns? Yes (no unnecessary abstractions)

**Architecture**:
- EVERY feature as library? Adapted for web: components as reusable libraries
- Libraries listed: data-loader (for JSON), question-browser, exam-simulator
- CLI per library: N/A (web app, no CLI)
- Library docs: llms.txt format planned? No

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? Yes
- Git commits show tests before implementation? Yes
- Order: Contract→Integration→E2E→Unit strictly followed? Adapted for web
- Real dependencies used? Yes (JSON files)
- Integration tests for: new libraries, contract changes, shared schemas? Yes
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? Yes (console for dev)
- Frontend logs → backend? N/A
- Error context sufficient? Yes

**Versioning**:
- Version number assigned? 1.0.0
- BUILD increments on every change? Yes
- Breaking changes handled? N/A (initial)

## Project Structure

### Documentation (this feature)
```
specs/001-i-m-building/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 2: Web application (frontend only)
app/
├── layout.tsx
├── page.tsx
├── browse/
│   ├── [category]/
│   │   └── page.tsx
├── exam/
│   ├── [category]/
│   │   └── page.tsx
└── api/
    └── data/
        └── route.ts

components/
├── QuestionCard.tsx
├── ExamTimer.tsx
└── ...

lib/
├── data.ts
├── types.ts
└── ...

public/
└── data/
    ├── category3.json
    ├── category2.json
    └── category1.json
```

**Structure Decision**: Option 2 adapted for frontend-only Next.js app with App Router

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context**:
   - JSON structure for questions: predetermined but needs definition
   - Best practices for loading JSON in Next.js 15
   - Responsive design patterns for sleek UI

2. **Generate and dispatch research agents**:
   ```
   Task: "Define JSON structure for ham radio Q&A data"
   Task: "Best practices for static data loading in Next.js 15"
   Task: "Modern responsive UI patterns for educational sites"
   ```

3. **Consolidate findings** in `research.md`:
   - Decision: JSON structure - { categories: { "3": { name: "Category 3", questions: [{ id: number, question: string, options: string[], correctIndex: number }] } } }
   - Rationale: Simple, extensible, matches requirements
   - Alternatives: Array of categories, but object for easy lookup

**Output**: research.md with all unknowns resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Category: id (string), name (string), questions (Question[])
   - Question: id (number), question (string), options (string[]), correctIndex (number)
   - Relationships: Category has many Questions

2. **Generate API contracts** from functional requirements:
   - GET /api/data - load all categories data
   - Use Next.js API routes for data loading
   - Output TypeScript interfaces to `/contracts/`

3. **Generate contract tests** from contracts:
   - Test data loading function
   - Assert JSON structure matches schema
   - Tests must fail initially

4. **Extract test scenarios** from user stories:
   - Browse questions: integration test for category selection and display
   - Exam simulation: test timer, scoring, random selection

5. **Update agent file incrementally**:
   - Run update-agent-context.ps1 for GitHub Copilot
   - Add Next.js 15, JSON data loading, responsive design
   - Output to .github/copilot-instructions.md

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, .github/copilot-instructions.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load tasks-template.md as base
- Generate tasks from Phase 1: data model, contracts, quickstart
- Contract test tasks for data loading [P]
- Model creation tasks for types [P]
- Component tasks for UI [P]
- Page tasks for routes
- Integration test tasks for user stories

**Ordering Strategy**:
- TDD: Tests before implementation
- Dependency: Types → Data loading → Components → Pages
- Mark [P] for parallel

**Estimated Output**: 20-25 tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*No violations - design follows simplicity principles*

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*