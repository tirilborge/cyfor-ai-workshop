---
name: pr-review
description: "Reviews pull requests for code quality, security, and modern TypeScript best practices. Use when reviewing PRs, checking code quality, finding security issues, or ensuring TypeScript best practices. Triggers: PR review, code review, pull request, security review, TypeScript review, code quality."
compatibility: GitHub Copilot
---

# PR Review — Concise & Secure TypeScript

Review pull requests with a focus on **concise code**, **security**, and **modern TypeScript** (5.x+).

**Keywords**: PR review, code review, security, TypeScript, best practices, pull request

---

## Review Checklist

### 1. Security

- [ ] **No secrets in code** — API keys, tokens, passwords must come from environment variables or secret managers, never hardcoded.
- [ ] **Input validation** — All user input (request bodies, query params, URL params) is validated and sanitized. Prefer `zod` schemas.
- [ ] **SQL injection** — Only parameterized queries or ORM methods (e.g., Prisma). Never string-interpolated SQL.
- [ ] **XSS** — No `dangerouslySetInnerHTML` or unescaped user content in templates.
- [ ] **Dependency safety** — Flag new/unfamiliar dependencies. Check for known vulnerabilities.
- [ ] **Auth & authz** — Ensure protected routes check authentication and authorization. No open endpoints that should be guarded.
- [ ] **Error handling** — Errors must not leak stack traces, internal paths, or DB details to clients.
- [ ] **CORS / headers** — Verify CORS config is not `*` in production. Security headers present.

### 2. Modern TypeScript

- [ ] **`satisfies` operator** — Prefer `satisfies` over `as` for type-safe validation without widening.
- [ ] **`using` declarations** — Use `using` / `await using` for disposable resources (DB connections, file handles).
- [ ] **`const` type parameters** — Use `<const T>` where literal types should be inferred.
- [ ] **Strict mode** — `strict: true` in tsconfig. No `any` without explicit justification.
- [ ] **Narrowing over casting** — Use type guards, `in` operator, or discriminated unions instead of `as`.
- [ ] **Template literal types** — Prefer template literal types for string patterns over loose `string`.
- [ ] **`readonly` by default** — Mark arrays and objects as `readonly` unless mutation is required.
- [ ] **No enums** — Prefer `as const` objects or union types over `enum`.

### 3. Conciseness

- [ ] **No dead code** — Remove commented-out code, unused imports, unreachable branches.
- [ ] **DRY** — Extract repeated logic into shared functions or constants.
- [ ] **Early returns** — Use guard clauses to reduce nesting.
- [ ] **Optional chaining & nullish coalescing** — Use `?.` and `??` instead of verbose null checks.
- [ ] **Object shorthand** — Use `{ name }` instead of `{ name: name }`.
- [ ] **Array methods** — Prefer `.map()`, `.filter()`, `.find()` over imperative loops when clearer.
- [ ] **Destructuring** — Use destructuring for function params and object access.

---

## Review Output Format

For each finding, use this format:

```
### <severity>: <short title>

**File:** `path/to/file.ts:lineNumber`
**Category:** Security | TypeScript | Conciseness

<1-2 sentence explanation>

// suggested fix (if applicable)
```

Severity levels:
- 🔴 **Critical** — Security vulnerability or data loss risk. Must fix.
- 🟡 **Warning** — Bug risk, missing types, or non-idiomatic code. Should fix.
- 🔵 **Suggestion** — Style improvement or modern TS feature opportunity. Nice to have.

---

## Common Anti-Patterns to Flag

| Anti-pattern | Fix |
|---|---|
| `as any` / `as unknown as T` | Use proper generics or type guards |
| `enum Direction { ... }` | `const Direction = { Up: 'up', Down: 'down' } as const` |
| `if (x !== null && x !== undefined)` | `if (x != null)` or `x ?? fallback` |
| `try { ... } catch (e) { console.log(e) }` | Typed error handling with `instanceof`, proper logging |
| `export default` | Prefer named exports for better refactoring |
| Mutable function params | `(items: readonly string[])` |
| `Promise` constructor for existing async | Just `return await` or chain `.then()` |
| `.then().catch()` chains | `async/await` with `try/catch` |

---

## Example Review Comment

```
### 🔴 Critical: SQL injection via string interpolation

**File:** `api/src/items.ts:42`
**Category:** Security

User-supplied `category` is interpolated directly into the SQL query.
Use Prisma's `where` clause or a parameterized query instead.

// Before
const items = await db.$queryRaw(`SELECT * FROM Item WHERE category = '${category}'`)

// After
const items = await db.item.findMany({ where: { category } })
```
