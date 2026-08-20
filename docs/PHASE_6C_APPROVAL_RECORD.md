# Phase 6C — Consolidated approval record

## Decision

- Status: **Approved for Phase 6C-1 implementation review after verification passes**.
- Approval date: **2026-08-21 (Asia/Riyadh)**.
- Approver: **Abdullah Alshabi, Product Owner**.
- Required baseline: `e0922a0aa544108a22833f6c11f162a729a72bc9` (`production-2026-08-01-phase-6b`).
- Consolidated review branch: `codex/phase-6c-consolidated-review`.

This record consolidates the two Phase 6C decision branches into one review unit based exactly on the approved Phase 6B production baseline.

## Approved decisions

1. Google Places API (New) is the approved official source for hotel place identity.
2. The first-release cost ceiling is Pro identity fields only. Ratings, review counts, reviews, photos, prices, and availability remain excluded.
3. Server authentication uses this approved chain:

   ```text
   Vercel Function
     -> short-lived Vercel OIDC token
     -> Google Cloud Workload Identity Federation
     -> dedicated service-account impersonation
     -> short-lived method-scoped Google OAuth access token
     -> Places API (New)
   ```

4. Long-lived Google API keys and service-account JSON keys are not approved for the primary server design.
5. The Arabic and English Privacy Policy and Terms & Conditions disclosures in `src/components/legal-page.tsx` are approved as the Phase 6C product copy and implementation basis.

The legal-copy approval above is a Product Owner decision. It does not represent or replace independent external legal advice.

## Mandatory verification gate

Phase 6C-1 implementation must not begin until the consolidated review PR passes all of these checks against this branch:

1. `npm run lint`
2. `npm run typecheck`
3. `npm test` — the complete test suite
4. `npm run build` — the production build

The repository workflow `.github/workflows/phase-6c-review.yml` enforces the same sequence. A skipped, cancelled, neutral, or failed check does not satisfy this gate.

## Scope of this approval

Passing the verification gate authorizes only a separate, reviewed Phase 6C-1 implementation PR for a disabled-by-default provider boundary and fake-provider tests.

This approval does **not** authorize:

- enabling Google Places API (New) or Google Cloud billing;
- creating Google Cloud or Vercel resources or configuration;
- adding credentials, tokens, or environment variables;
- making real or billable provider requests;
- enabling hotel search in Preview or Production;
- changing `ProductStage` from `prelaunch`;
- removing `noindex, nofollow` or allowing public indexing;
- publishing or launching the capability;
- adding any field outside the approved Pro identity scope.

## Remaining activation gates

The unchecked activation controls in `docs/PHASE_6C_HOTEL_DATA_SPEC.md` remain mandatory. In particular, implementation approval does not replace current pricing and terms verification, billing ownership, environment-isolated identity bindings, quotas, budgets, alerts, attribution review, capability wording approval, Preview verification, or an explicit Production activation decision.

The public-launch evidence flags remain unchanged. Approving this design and copy does not by itself establish that the full product has passed legal, security, editorial, analytics, or launch-readiness review.
