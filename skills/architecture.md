# Skill: MPC Architecture

## Mission
Build MPC as a public learning notebook and knowledge base that helps people understand and solve real problems.

## Core boundary
Fixed Core:
- Map
- Method

Evolving Layer:
- Cases
- Terms explanations
- Tools

Community content must not silently mutate the Fixed Core.

## Extension rule
Before adding a feature, answer:
1. What real user problem does it solve?
2. Which part of MPC does it belong to?
3. Is it Fixed Core or Evolving Layer?
4. Can it be added without changing existing behavior?
5. What data boundary prevents unsafe input?
6. How can it be removed or rolled back?

## Technical principles
- Prefer simple modules over premature frameworks.
- Keep content, presentation and behavior separable.
- Avoid unnecessary dependencies.
- Validate external input at the boundary.
- Sanitize user-generated content before rendering.
- Never trust client-side authorization.
- Keep changes small and reversible.
- Document intent, not obvious syntax.
