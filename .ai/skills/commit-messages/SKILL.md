---
name: commit-messages
description: Write clear Conventional Commit-style git commit messages. Use when drafting, reviewing, or improving commit messages, especially when choosing prefixes like feat:, fix:, chore:, docs:, refactor:, test:, style:, perf:, build:, or ci:.
---

# Commit Messages

## Format

Use a concise Conventional Commit-style subject:

```text
type: subject
```

Do not add a scope in parentheses after the type.

## Choosing A Type

- `feat`: A new user-facing capability or meaningful product behavior.
- `fix`: A bug fix or correction to broken behavior.
- `chore`: Maintenance that does not change product behavior.
- `docs`: Documentation-only changes.
- `refactor`: Code restructuring without intentional behavior changes.
- `test`: Adding or updating tests.
- `style`: Formatting-only changes that do not affect behavior.
- `perf`: Performance improvements.
- `build`: Build system, dependency, or packaging changes.
- `ci`: CI workflow or automation changes.

## Writing The Subject

- Use imperative mood: `fix login redirect`, not `fixed login redirect`.
- Keep it specific and short, usually under 72 characters.
- Do not end the subject with a period.
- Describe the user-visible or maintainer-relevant outcome, not every edited file.
- Choose the most important type when a commit contains mixed changes.

## Body Guidance

Add a body when the reason, tradeoff, migration detail, or behavior change is not obvious from the subject. Keep it brief and explain why the change exists.

```text
fix: preserve redirect after token refresh

Store the pending route before refreshing credentials so users return to the
screen they originally opened.
```

## Examples

```text
feat: add comment detail screen
```

```text
fix: keep focus after deleting a digit
```

```text
refactor: simplify avatar upload state
```

```text
chore: update Expo dependencies
```

## Checklist

- The prefix matches the purpose of the change.
- The summary is written in imperative mood.
- The message explains the outcome rather than listing files.
- The body is present only when it adds useful context.
