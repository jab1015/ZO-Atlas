# Atlas Build Start Plan

**Date:** 2026-07-21
**Status:** Product-agnostic Atlas foundation confirmed; the first real invention is reserved for post-build acceptance testing
**Scope:** Build the reusable Atlas invention operating system first. Do not seed a founder invention, hard-code its requirements, or add it to the app before the generic workflow is usable.

## Product decision

Atlas must accept a new invention from scratch after the application is built. The first real project will be created by the inventor inside the finished app to evaluate how well Atlas handles a complete invention workflow. Different consumer and commercial product variants must remain separate when they are eventually created.

## Recommended first milestone

Deliver one product-agnostic end-to-end vertical slice that can later be exercised with any real invention:

1. Create a blank invention project
2. Capture an inventor's idea and goals in plain language
3. Generate product requirements from scratch
4. Run competitor and patent-landscape research
5. Generate an engineering specification and design alternatives
6. Create a parametric CAD job from structured requirements
7. Export STEP/STL/3MF and supporting files when the CAD worker is available
8. Generate BOM, materials, drawings, and validation plans
9. Run fit, clearance, seal, torque, and manufacturability checks appropriate to the product
10. Create a prototype-ready release package
11. Stop at explicit human approval gates
12. Capture test results and revise the project

No founder project, requirements, CAD asset, research result, or demo data should be inserted into the app during foundation development. The first real invention is an acceptance scenario to be entered by the inventor after the app is ready.

## Architecture direction

- Keep the current Atlas web application as the user-facing operating system.
- Configure production Convex deployment and secure multi-user data isolation.
- Use background task workers for research, document processing, notifications, and CAD generation.
- Use a real geometry kernel and parametric modeling workflow for CAD, not image-to-mesh output.
- Store every CAD artifact with source specification, revision, generation metadata, validation results, and approval status.
- Separate concept, prototype-ready, engineering-review-ready, manufacturing-review-ready, and manufacturing-released states.
- Require explicit human approval at patent/legal, food-contact/safety, engineering, manufacturing, vendor, financial, communication, and public-launch gates.
- Keep all external communications in an approval queue; Atlas drafts automatically but never sends without approval.
- Keep development private, beta password-protected and private, and Version 1.0 behind secure authentication on a custom domain.

## First implementation tracks

### Track 1: From-scratch invention intake and generation

- Let the inventor enter an idea in plain language with only the goals, intended users, target price, and constraints they know.
- Ask only high-value clarifying questions that Atlas cannot safely infer.
- Generate the MRD, product requirements, design brief, mechanism alternatives, material candidates, manufacturing assumptions, patent-research plan, competitive-research plan, and commercial hypotheses automatically.
- Mark every generated item as an assumption, researched fact, inventor decision, or professional-review item.
- Preserve every generated artifact, source URL, calculation, decision, and revision in the project knowledge base.
- Accept optional founder documents later as evidence or corrections; they are not required to start.

### Track 2: Product and workflow foundation

- Define a product-agnostic engineering requirements schema.
- Support related product variants without coupling them to a specific invention.
- Add requirements, decisions, risks, assumptions, open questions, and test cases.
- Add task queue and department outputs.
- Add explicit approval records and immutable artifact revisions.

### Track 3: CAD worker

- Define structured geometry input and output contracts.
- Build a prototype CAD worker using a geometry kernel.
- Generate a parametric assembly from a user-created invention specification.
- Export STEP AP242, STL, 3MF, and a basic drawing package when the CAD worker is configured.
- Add geometry validity, watertightness, interference, clearance, wall-thickness, seal, and basic process checks.
- Store and display CAD revisions in Atlas.
- Keep files labeled prototype-ready until test evidence and qualified review are complete.

### Track 4: Product acceptance validation

- Add product-specific test planning generated from each inventor's requirements.
- Add results capture with measured values, photos, notes, and pass/fail criteria.
- Feed test failures back into the requirements and CAD revision loop.
- After the generic app is ready, use the inventor’s first real project as the acceptance project without preloading it into the product.
- Create an engineering review package rather than claiming autonomous certification.

### Track 5: Research and evidence

- Connect patent and market research providers.
- Preserve source URLs and research timestamps.
- Separate evidence from AI-generated interpretation.
- Add confidence, uncertainty, and professional-review flags.
- Create a patent/FTO review queue for an attorney.

### Track 6: Commercial variant

- Let inventors create separate product variants for different use cases and customer segments.
- Research filling-line, closure, tamper-evidence, shelf-life, food-contact, packaging, and unit-economics constraints when a commercial package is requested.
- Create brand-customizable CAD configurations and commercial RFQ outputs.
- Keep each variant's BOM, economics, regulatory evidence, and approvals separate.

### Track 7: Commercial SaaS

- Connect authentication, subscriptions, credits, and usage limits.
- Add storage and signed downloads for project files.
- Add audit history and tenant isolation.
- Add notification and approval workflows.
- Add private beta deployment and custom-domain production deployment.

## Minimum inventor input to begin

Atlas must be able to start with only:

- An idea described in plain language
- The intended customer or use case, if known
- Any non-negotiable constraints the inventor already knows
- The inventor's approval of major assumptions and generated directions

For any invention, the initial plain-language description is enough to create a project and begin the first automated workflow. Existing documents, sketches, prototypes, test data, supplier conversations, and confidentiality agreements are optional inputs that can be added later. Atlas should identify when their absence creates uncertainty rather than blocking the project.

The founder’s invention is intentionally not a seeded project or built-in demo. It will be entered by the inventor after the generic app foundation is complete.

The inventor may still need to provide information Atlas cannot observe or safely infer, such as physical test results, ownership confirmations, private disclosures, access to a prototype, or approval of a design choice. Atlas must ask for those items at the point they become necessary.

## Release language

Atlas must not call a file factory-ready merely because it exported successfully. Factory-ready requires a complete drawing/BOM/material package, process-specific design-for-manufacturing checks, testing evidence where applicable, revision control, explicit approval, and qualified human review.
