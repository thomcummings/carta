# Code Conventions

Code should be readable and well-documented—assume the reader isn't a senior engineer.

## File Headers

Every file should start with a brief header comment explaining:
- What this file/module is responsible for
- Key dependencies or relationships (if not obvious from imports)

Keep it to 2-3 lines. If you need more, the file might be doing too much.

## Function & Method Comments

Every function should have a comment explaining:
- **What** it does (one line)
- **Why** it exists, if not obvious from the name
- **Returns** — what the caller gets back

Skip parameter documentation unless types aren't self-explanatory.

## Inline Comments

Use inline comments for:
- Non-obvious logic ("why this approach, not the obvious one")
- Business rules embedded in code
- Workarounds or edge case handling
- Anything a reader might ask "why?" about

Don't comment obvious operations.

## Complex Logic

When logic is genuinely complex (algorithms, state machines, intricate conditionals):
- Add a brief prose explanation above the block
- If the "why" is substantial, document in `docs/learnings.md` or the relevant feature doc and reference it: `// See docs/learnings.md#auth-flow-workaround`

## TODO/FIXME Markers

Format: `// TODO(scope): description`
- `TODO(v2)` — planned improvement, not blocking
- `TODO(now)` — needs addressing before merge
- `FIXME` — known issue, needs fix
- `HACK` — intentional shortcut, explain why

## Naming Conventions

### Variables & Functions
- `camelCase` for variables and functions: `getUserData`, `isLoading`
- Boolean variables should read as questions: `isLoading`, `hasError`, `canSubmit`, `shouldRefresh`
- Functions should start with verbs: `fetchUser`, `calculateTotal`, `handleClick`

### Components & Classes
- `PascalCase` for components, classes, types: `UserProfile`, `ApiService`

### Constants
- `SCREAMING_SNAKE_CASE` for true constants: `MAX_RETRIES`, `API_BASE_URL`

### Files
- Components: `PascalCase.tsx` — `UserProfile.tsx`
- Utilities/hooks: `camelCase.ts` — `useAuth.ts`, `formatDate.ts`
- Keep filenames matching their primary export

## Magic Numbers & Strings

Extract to named constants. No unexplained values buried in logic.
// Bad Example:
if (attempts > 3) { ... }
if (status === 'active') { ... }

// Good Example:
const MAX_RETRY_ATTEMPTS = 3;
const STATUS_ACTIVE = 'active';

if (attempts > MAX_RETRY_ATTEMPTS) { ... }
if (status === STATUS_ACTIVE) { ... }

## Error Handling

- Always handle errors explicitly—no silent failures
- Error messages should be human-readable and actionable
- Include context about what was attempted and what went wrong

// Bad Example:
catch (e) { console.log(e); }

// Good Example:
catch (error) {
  // Log context for debugging, surface friendly message to user
  console.error(`Failed to fetch user ${userId}:`, error);
  throw new Error(`Unable to load user profile. Please try again.`);
}

### Evergreen Code

Names and comments should describe what the code *is*, not its history:
- ❌ `NewAPI`, `LegacyHandler`, `ImprovedParser`
- ❌ "Refactored from old system", "Better than previous version"
- ✅ `APIClient`, `RequestHandler`, `Parser`
- ✅ "Validates input before processing"

If you're tempted to write "new", "old", "improved", or "legacy" — find a name that describes the actual purpose.

## File Organisation

Organise files in this order:
1. **Imports** — external, then internal, then styles
2. **Types/Interfaces** — local type definitions
3. **Constants** — values used in this file
4. **Helpers** — small utility functions specific to this file
5. **Main logic** — primary component/function/class
6. **Exports** — prefer named exports for easier refactoring
