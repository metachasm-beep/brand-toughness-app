# SaaS Migration & Backend Enhancement Plan

This plan outlines the steps to transform the existing Website Audit tool into a monetizable SaaS platform, moving away from Google Sheets and utilizing the advanced logic found in the new project files.

## 1. Core Architecture Transition
*   **Database**: Move from Google Sheets to a robust SQL database (PostgreSQL via Supabase/Neon or Cloudflare D1).
*   **ORM**: Implement Prisma for type-safe data management.
*   **Authentication**: Enhance existing NextAuth session to include user roles (Free vs. Pro).

## 2. Advanced Analysis Porting (from BrandOS & Health Audit AI)
*   **Port 100+ Checks**: Migrate the comprehensive SEO, Accessibility, Security, and Performance checks from the Python notebooks into a TypeScript analysis engine.
*   **Crawl Agent**: Implement a multi-page crawler (BFS) for deep site audits (Pro feature).
*   **AI Insights**: Integrate Groq/Gemini for generating meaningful recommendations based on crawl data.

## 3. Monetization Strategy
*   **Tiered Access**:
    *   **Free**: Basic audit (Top 10 issues), on-screen results only.
    *   **Pro ($19/mo)**: Full 115+ check audit, PDF downloads, multi-page crawling, unlimited history.
    *   **Business ($49/mo)**: Batch auditing, white-labeled reports, API access.
*   **Stripe Integration**: Connect Stripe for billing and subscription management.

## 4. Enhanced UI/UX
*   **Premium Dashboard**: A "Member's Area" showing site health trends over time.
*   **Interactive Reports**: Deep-dive modals for each finding with "How to fix" code snippets.
*   **Whitelabeling**: Allow business users to add their custom branding to generated PDFs.

## 5. Next Steps (Development Phase)
1.  **Setup Database Schema**: Define `Audit`, `Finding`, and `Subscription` models.
2.  **Audit Engine Refactor**: Create a dedicated `lib/audit` module to centralize analysis.
3.  **PDF Engine**: Implement high-fidelity PDF generation (server-side).
4.  **Stripe Hooks**: Set up webhook handlers for automated tier upgrading.
