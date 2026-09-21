# MPC Deconstructor

> Học để giải quyết vấn đề thật, không phải học để đi thi.

MPC Deconstructor is a public learning notebook, method and community knowledge base built around one idea: learn to solve problems, not to pass exams.

## Version 0.1

The prototype intentionally stays small:
- Light educational visual direction inspired by the clarity and approachable structure of GeoGebra.
- Hero / product story
- "What's wrong?" section
- School vs MPC comparison
- Six critique cards with explicit visual placeholders
- One large collage placeholder + one real-life illustration placeholder
- Five navigation boxes
- Placeholder pages for Map, Method, Cases, Terms and Tools
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

Evolving / Community Layer:
- Cases
- Terms explanations
- Tools

The community layer may expand the knowledge base, but it must not silently change the core MPC method or philosophy.

## Safety and maintainability

v0.1 is deliberately dependency-free. The site uses same-origin local assets, no third-party scripts, no runtime data writes, and a restrictive Content-Security-Policy.

Before adding a backend or community submissions, define validation, authentication/authorization, moderation, attribution, rate limiting, content sanitization, auditability, backups and rollback.

## Local development

This is a static site. Serve the repository with any local static HTTP server and open index.html.

## Roadmap

See todo.html and CHANGELOG.txt.
