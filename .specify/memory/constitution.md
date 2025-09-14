# Next.js 15.5 App Constitution

## Core Principles

### I. App Router Mandatory
All routing must utilize the app directory structure introduced in Next.js 13+. The legacy pages directory is not permitted. Routes should be organized in the app/ directory with layout.tsx and page.tsx files as appropriate.

### II. Server Components First
Prefer server components for optimal performance and SEO. Client components should only be used when interactivity is required, such as for event handlers or browser APIs. Mark client components with 'use client' directive.

### III. TypeScript Required
All source code must be written in TypeScript. Strict type checking is enabled. No JavaScript files are allowed in the codebase.

### IV. Test-First Development
Adopt Test-Driven Development (TDD) practices. Write unit tests for components and integration tests for pages before implementing features. Use Jest and React Testing Library.

### V. Accessibility Standards
Ensure all components meet WCAG 2.1 AA standards. Use semantic HTML, proper ARIA attributes, and test with screen readers. Include alt text for images and sufficient color contrast.

## Technology Stack

- **Framework**: Next.js 15.5 with App Router
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS, Shadcn
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint with Next.js config
- **Package Manager**: npm or yarn
- **Deployment**: self-hosted

## Development Workflow

- Use Git for version control with feature branches
- Create pull requests for all changes
- Require code reviews and passing CI checks
- Follow conventional commit messages
- Deploy to staging environment for testing before production

## Governance

This constitution defines the foundational principles for the Next.js application. All development must adhere to these principles. Amendments require consensus and documentation of rationale.

**Version**: 1.0 | **Ratified**: 2025-09-14 | **Last Amended**: 2025-09-14