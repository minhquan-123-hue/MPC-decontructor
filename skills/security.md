# Skill: MPC Security

## Goal
Keep MPC safe as it evolves from a static prototype into a community knowledge system.

## Static prototype
- Prefer no third-party scripts.
- Keep a restrictive Content-Security-Policy.
- Keep external links explicit and safe.
- Avoid inline JavaScript where possible.
- Never store secrets in the repository.

## User-generated content
Treat submitted text, URLs, images and metadata as untrusted input.

Required controls:
- server-side validation
- output encoding / HTML sanitization
- authentication and authorization
- rate limiting
- moderation / abuse reporting
- safe URL handling
- upload type and size limits
- audit logs for important changes
- backups and rollback

## Authorization
Never rely on hidden UI controls for permissions. Protected actions must be checked server-side.

## External resources
Do not automatically embed arbitrary third-party content. Prefer controlled links. If embedding is necessary, define an explicit allowlist and sandbox policy.

## Secrets
API keys, database credentials and tokens stay outside source control and client-side code.

## Change discipline
Security-sensitive changes should be small, reviewed, and documented in CHANGELOG.txt.
