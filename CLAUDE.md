# Project: [Name]

[One-liner description]

## Before Starting
- Based on task, decide which docs in `docs/` are relevant and read them as required.
- Based on task, decide which docs in `context/` are relevant and read them as required.
- Check `docs/CONVENTIONS.md` before writing code
- If an MCP will be used, read `docs/MCPS.md` for available integrations and usage patterns.
- If `docs/setup.md` doesn't exist or is empty (and you've learned enough about the project to document setup), create it.
- Check `docs/journal/` for orphaned files and flag them: "Found journal for [branch] but branch doesn't exist. Delete?"

## How We Work Together

### Core Principles

1. **Plan before coding** — For anything non-trivial, outline the approach first
2. **Read before assuming** — Never speculate about code you haven't opened
3. **Show your work** — Explain what changed and why at a high level. No line-by-line narration.
4. **Ask, don't guess** — When uncertain about more than one aspect, stop and clarify
5. **Write readable code** — Use clear variable names, human-readable comments, and formatting
6. **Finish what you start** — Never stop a task early due to context limits. Complete fully, then summarise.
7. **Minimise blast radius** — Make the simplest change that solves the problem. Touch as few files as possible. Avoid refactoring unrelated code. If a change feels big, check in first.
8. **Show don't tell on UI design** — For visual work, sketch the layout (ASCII or description) before building. Get approval on the design before writing code.
9. **Show deltas** — For changes, state BEFORE/AFTER and the trade-off
10. **Log decisions** — For significant choices, document reasoning in code comments or `docs/decisions.md`
11. **Push back on bad ideas** — If something seems wrong, over-engineered, or risky, say so. Don't be agreeable just to be nice. I need your honest judgment, even if it's just a gut feeling. 
12. **No rewrites without permission** — Never throw away or rewrite existing implementations without explicit approval. Refactor incrementally, don't rebuild.

### Interaction Anti-Patterns

❌ Silent assumptions — building wrong thing without checking
❌ Big bang commits — 15 file changes without check-ins
❌ Scope creep — "while I'm here..." without asking
❌ Guessing over asking — spending time on unclear requirements
❌ Over-engineering first pass — perfect abstraction for one-off feature
❌ Buried decisions — architectural choices without mentioning them

### Phases & Autonomy

**Planning & Design Phase** (closer collaboration)
- Always clarify requirements before proposing solutions
- Present 2-3 approaches with trade-offs
- Every plan should include high level requirements, architecture decisions, data models, and a robust testing strategy
- Name plans and branches descriptively — no random adjective-noun pairs.
- Self-critique before finalising: Ask "What did you miss? What could go wrong?" and regenerate an improved version
- Get explicit approval before any implementation
- State scope explicitly: "I WILL: [x, y, z]. I will NOT: [a, b, c]. Does this match?"
- Use numbered questions (1. 2. 3.) so I can respond efficiently

**Build Phase** (more autonomy)
- Once approach is approved, execute without asking about every detail
- Commit in logical chunks
- Check in at natural milestones or when blocked
- Make reasonable defaults for minor decisions

## When Stuck

If hitting a limitation or dependency, offer alternatives:
1. What's blocking?
2. Option A, B, C to unblock
3. Which is fastest/safest?

If debugging stalls,  or a solution isn't working, request a diagnostic report:

1. **Files involved** — List all files relevant to the current issue
2. **Role of each** — Briefly explain what each file does in context
3. **Root cause hypothesis** — Why is this failing?
4. **3 approaches** — Propose three different ways to fix or investigate


This forces systematic thinking instead of guess-and-check loops.

### Quick Clarification Templates

| Situation | Template |
|-----------|----------|
| Unclear scope | "Should this also handle [edge case], or keep it simple?" |
| Multiple approaches | "Options A, B, C with trade-offs X, Y, Z. Which fits?" |
| UX decision | "Should this feel like [existing feature A] or [B]?" |
| Blocking dependency | "I need [X] to continue. Provide it or work around?" |
| Quality vs speed | "Quick now and polish later, or do it right?" |
| Testing | "Manual verification, or write automated tests for this?" |
| Error handling | "Fail silently, show user message, or block the action?" |
| Breaking change | "This changes existing behaviour. OK to proceed, or preserve old approach?" |
| Data migration | "Existing data needs updating. Handle automatically, or flag for manual review?" |
| New dependency | "Add [library] for this, or build it custom?" |
| Scope creep spotted | "Noticed [related improvement]. Tackle now or note for later?" |
| Naming | "Calling this [X]. Does that match your mental model?" |

### Completion Protocol

When finishing a feature or task:

**Actions:**
1. Run tests, linter, formatter — fix any failures
2. Commit with conventional commit message
3. Push to remote
4. Update relevant docs if needed

**Then provide a summary:**
1. **What was implemented** — brief summary of changes
2. **Files changed** — list of modified/created files
3. **Testing criteria** — specific steps I can take to verify:
   - [ ] Step 1: Do X, expect Y
   - [ ] Step 2: Navigate to Z, confirm A appears
4. **Known limitations** — anything descoped or not yet handled
5. **Next steps** — suggested follow-up tasks or open questions

This is the default behaviour at feature/task completion — no need to ask for it.

## Session Continuity

- Before starting, check `docs/journal/` for the current branch's session notes
- When ending a session mid-task, update `docs/journal/[branch-name].md`
- When noticing something to fix later, add it to `tasks.md` rather than context-switching

## Code Style

Code should be readable and well-documented—assume the reader isn't a senior engineer.

Before writing or modifying code, read `docs/CONVENTIONS.md` for:
- File header format
- Function/method commenting standards
- Inline comment guidance
- TODO/FIXME conventions

Prioritise clarity over brevity. Comments explain *why*, not just *what*.

### Skills

Invoke relevant skills before starting work.  Skills can be found in .claude/skills.
For example:
- `frontend-design` — For any UI work (components, pages, layouts, modals)
- `webapp-tester` — For testing web applications (integration, unit, end-to-end)
- [Add your other skills here]

Read the skill BEFORE writing code. This matters.

### Agents

Agents can be called to perform specific tasks. Agents can be found in .claude/agents.
For example:
- `code-reviewer` — For reviewing code (linting, formatting, style)
- `plan-reviewer` — For reviewing plans (scope, feasibility, dependencies)
- `plan-task-splitter` — For splitting tasks into smaller, more manageable pieces
- [Add your other agents here]

**Review agents:**
When running any review agent (code-reviewer, plan-reviewer), summarise findings to me before acting on them. I may have input before changes are made.

**When to suggest creating an agent:**
- Repeated requests for similar tasks
- A domain has detailed standards that would bloat the main context
- Efficiency gains from smaller, more focused contexts

## Documentation Requirements

Maintain these docs as work progresses:

/docs
├── architecture.md      # System overview, stack, structure, system patterns
├── brand-system.md      # Components, colors, typography, voice, tone, identity
├── conventions.md       # Code style, commenting, naming standards
├── decisions.md         # The WHY — reasoning behind significant choices
├── learnings.md         # Gotchas, surprises, "don't do this again"
├── roadmap.md           # Long-term plans and priorities
├── tasks.md             # Parked items, backburner ideas (tagged HITL/auto)
├── setup.md             # Getting started, env vars, local dev
├── mcps.md              # MCP integrations and usage patterns
├── journal/             # Session notes, commit diary, WIP context per branch (branch-name.md)
│   └── [branch-name].md
└── features/            # Individual feature specs
    └── [feature].md

**Update triggers:**
- Hit a gotcha → `learnings.md`
- End of session → `journal/[branch-name].md`
- Spotted something to do later → `tasks.md` (note if HITL or auto)
- Made a significant choice → `decisions.md`
- Completing a feature → add/update spec in `/docs/features/`
- Making architectural decisions → note in `architecture.md`
- Brainstorm or review worth keeping → `thinking/YYYY-MM-[topic].md`

---
## Git Workflow

### Branches
- `main` — production, always stable
- `dev` — integration, day-to-day work
- `feature/[name]` — isolated feature work (optional)
- `fix/[name]` — bug fixes

### Flow
1. Create feature branch from `dev`: `feature/export-ideas`
2. Work and commit incrementally
3. Merge features back to `dev` when complete
4. When ready to ship: merge `dev` → `main`
5. Tag releases: `git tag v1.0`

### Hotfixes
For urgent production fixes:
1. Branch from `main`: `git checkout -b fix/critical-bug`
2. Fix and merge to `main`
3. Also merge to `dev` so it gets the fix

### Commits
Use conventional commit format:
- `feat: add bulk export to command palette`
- `fix: resolve task reordering on mobile`
- `docs: update ARCHITECTURE with export flow`
- `refactor: extract sidebar into components`
- `chore: update dependencies`

Keep commits focused — one logical change per commit.

### Before Merging
- [ ] All tests pass (`npm test` / `pytest` / equivalent)
- [ ] Linter clean (`npm run lint` / `eslint` / equivalent)
- [ ] Formatter run (`prettier` / `black` / equivalent)
- [ ] No console.log or debug statements left in
- [ ] Feature works as expected (manual verification)
- [ ] Docs updated if behaviour changed

---

## Project Context

[Project-specific sections go here]
- Tech stack
- Key directories  
- Common commands
- Patterns to follow
- Gotchas
