# MPC Deconstructor

> Học để giải quyết vấn đề thật, không phải học để đi thi.

MPC Deconstructor is a public learning notebook and method built around one idea: learn to solve problems, not to pass exams.

## Current state

The prototype intentionally stays small:
- Light educational visual direction inspired by the clarity and approachable structure of GeoGebra.
- Hero / product story
- "What's wrong?" section
- School vs MPC comparison
- Six critique cards with explicit visual placeholders
- One large collage placeholder + one real-life illustration placeholder
- Four navigation boxes
- Map and Method as Fixed Core
- Cases as the central and only Supabase-backed persistent user content
- Tools page with the Gemini launcher
- Case images stored in Supabase Storage
- todo.html roadmap
- CHANGELOG.txt version history
- skills/ project-extension instructions

GeoGebra was used as a visual reference for a lighter educational layout: clear navigation, approachable cards, visual resources and interactive-learning emphasis. This is inspiration, not a copy. https://www.geogebra.org/?lang=en

## Visual asset plan

The current "Why school sucks" section reserves 8 visual slots:
- 6 card-level visuals, one per critique.
- 1 large hero meme/collage.
- 1 real-life photo/illustration.

Prefer original MPC illustrations, properly licensed/public-domain assets, or clearly attributed assets where required. Do not ship random internet memes without checking copyright and context.

## Folder structure

v0.1 deliberately keeps a flat static structure because there are only a few pages and one shared stylesheet. Moving every file into folders now would add path complexity without solving a real problem.

Current logical grouping:
- root HTML pages = routes/pages
- styles.css = shared presentation
- README.md, CHANGELOG.txt = documentation
- skills/ = reusable build knowledge

Introduce folders when a category becomes large enough to benefit from a boundary:
- assets/images/ when real images/illustrations accumulate.
- styles/ when multiple stylesheets appear.
- scripts/ when JavaScript becomes a real subsystem.
- data/ when content becomes structured local data.
- components/ only if a repeated component system actually appears.

Do not create empty architecture for imaginary future complexity.

## Architecture rule

Fixed Core:
- Map
- Method

Evolving Layer:
- Cases
- Tools

Cases are the only persistent user-content boundary. Tools can document or launch useful external tools without becoming another knowledge-management database.

The evolving layer may expand around real usage, but it must not silently change the core MPC method or philosophy.

## Data model

Supabase is intentionally minimal:

Supabase
├── Auth
│   └── Anonymous users
├── Database
│   └── cases
└── Storage
    └── case-images

The Cases record currently stores:
- Problem
- Keywords + Units / Numbers
- Deconstruct → Small Problems
- optional image path

Do not add terms, formulas, mistakes or questions tables just to organize knowledge. External notes such as Google Sheets can handle deeper knowledge tracking when needed.

## Safety and maintainability

The site remains lightweight and dependency-free on the frontend. Supabase is used for authenticated, user-scoped notebook data and private case-image storage. The browser uses only the publishable Supabase key; authorization is enforced by database/storage RLS policies.

Before expanding community submissions, define moderation, attribution, rate limiting, content sanitization, auditability, backups and rollback.

## Local development

This is a static site. Serve the repository with any local static HTTP server and open index.html.

## Roadmap

See todo.html and CHANGELOG.txt. The roadmap reflects the current Cases-centered architecture rather than the original prototype milestones.
