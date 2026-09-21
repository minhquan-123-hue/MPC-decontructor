# MPC Deconstructor

> Học để giải quyết vấn đề thật, không phải học để đi thi.

MPC Deconstructor is a public learning notebook, method and community knowledge base built around one idea: learn to solve problems, not to pass exams.

## Version 0.1

This prototype intentionally stays small:
- Hero / product story
- What's wrong? section
- School vs MPC comparison
- Five navigation boxes
- Placeholder pages for Map, Method, Cases, Terms and Tools
- todo.html roadmap
- CHANGELOG.txt version history
- skills/ project-extension instructions

## Architecture rule

Fixed Core:
- Map
- Method

Evolving / Community Layer:
- Cases
- Terms explanations
- Tools

The community layer may expand the knowledge base, but it must not silently change the core MPC method or philosophy.

## Safety and maintainability

v0.1 is deliberately dependency-free. The site uses same-origin local assets, no inline JavaScript, no third-party scripts, no runtime data writes, and a restrictive Content-Security-Policy.

Before adding a backend or community submissions, define:
- validation boundaries
- authentication and authorization
- moderation
- attribution
- rate limiting
- content sanitization
- auditability
- backups and rollback

## Local development

This is a static site. Serve the repository with any local static HTTP server and open index.html.

## Roadmap

See todo.html and CHANGELOG.txt.
