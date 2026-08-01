# Phase 6C — Vercel and Google authentication review

## Status

- Review date: 2026-08-01.
- Scope: read-only review and authentication decision.
- Vercel project: `safrbwai`.
- Product stage: `prelaunch`.
- Google Places API (New) remains disabled.
- Phase 6C-1 has not started.
- No Vercel setting, environment variable, Google Cloud resource, credential, domain, WAF rule, or deployment was changed during this review.

This document closes the design review for authenticating SafrBwai server functions to Google Places API (New). It does not authorize creating Google Cloud resources, enabling billing, adding Vercel configuration, making a real Places request, or exposing the hotel feature.

## Practical Vercel findings

The authenticated Vercel project settings were reviewed without editing them.

- The project is on a Pro team.
- **Secure Backend Access with OIDC Federation** is available and already uses the recommended **Team** issuer mode.
- The visible production token claims are scoped to the exact Vercel team, project `safrbwai`, and environment `production`.
- The production subject has the form:

  ```text
  owner:abdullah-shabis-projects:project:safrbwai:environment:production
  ```

- No Google Places key or Google-specific project environment variable was visible in the project environment-variable list at review time.

These findings mean the Vercel side can issue short-lived, project-and-environment-bound OIDC tokens. They do not prove that Google Cloud federation is configured; that work remains blocked until this decision and the legal updates are approved.

## Decision

Use this server authentication chain:

```text
Vercel Function
  -> short-lived Vercel OIDC token
  -> Google Cloud Workload Identity Federation
  -> dedicated service-account impersonation
  -> short-lived Google OAuth access token
  -> Places API (New)
```

Do not create or store a long-lived Google API key or service-account JSON key for the primary design.

This decision is based on the following provider capabilities:

- Vercel OIDC issues short-lived, non-persistent tokens and supports Google Cloud Workload Identity Federation.
- Google Maps Platform recommends OAuth for trusted server-to-server calls when the selected API supports it.
- Places API (New) Text Search and Place Details accept OAuth authorization.

## Required Google Cloud configuration

The following is an approval checklist, not an instruction to make changes during this PR.

1. Use a Google Cloud project with billing ownership explicitly assigned and Places API (New) as the only Maps service enabled for this workload.
2. Create one Workload Identity Pool and one OIDC provider for the Vercel team issuer:

   ```text
   https://oidc.vercel.com/abdullah-shabis-projects
   ```

3. Set the allowed audience to:

   ```text
   https://vercel.com/abdullah-shabis-projects
   ```

4. Map `google.subject` to `assertion.sub`.
5. Create a dedicated service account for SafrBwai Places access. Do not reuse a service account from another workload.
6. Grant `roles/iam.workloadIdentityUser` on that service account only to the exact Vercel subject that needs access. Do not grant it to every identity in the pool.
7. Use separate service accounts and subject bindings for `preview` and `production`. Production must bind only:

   ```text
   owner:abdullah-shabis-projects:project:safrbwai:environment:production
   ```

   Preview must bind only the equivalent `environment:preview` subject and use lower quotas. A Preview identity must not impersonate the Production service account.
8. Do not create a service-account private key.
9. Request only the narrow Places OAuth scopes needed by the call:
   - Text Search: `https://www.googleapis.com/auth/maps-platform.places.textsearch`
   - Place Details: `https://www.googleapis.com/auth/maps-platform.places.details`
10. Do not request the broad `cloud-platform` scope when the method-specific scope works.
11. Keep the Google Cloud project number, pool ID, provider ID, project ID, and service-account email as server-only configuration. These identifiers are not credentials, but they must not use a `NEXT_PUBLIC_` name.
12. Keep the server feature disabled by default and fail closed when OIDC exchange, impersonation, scope authorization, quota, or billing is unavailable.

## Runtime controls required before activation

- The browser calls only the SafrBwai server endpoint and never Google Places directly.
- The server obtains a Vercel OIDC token at request time and exchanges it for a short-lived Google access token.
- Tokens, authorization headers, upstream request bodies, and Google error bodies are never logged or serialized.
- Search input is validated before a billable provider request.
- Text Search and Place Details have independent, low initial quotas and billing alerts.
- Application rate limits are lower than provider quotas.
- No automatic retry is allowed for a billable Places request.
- Preview and Production have separate service-account bindings and quota controls.
- Local and CI tests use a fake provider transport and never require Google credentials or make billable calls.

## Rejected primary options

### Unrestricted or API-only restricted API key

Rejected. Restricting a key only to Places API (New) limits what the key can call but does not stop a stolen key from being used by another server.

### Service-account JSON key

Rejected. It creates a long-lived private credential that must be stored, rotated, and protected. Workload Identity Federation avoids that credential.

### Vercel Static IP plus IP-restricted API key

Not selected as the primary design. It is a viable fallback only if a later proof shows that the approved OAuth flow cannot call the required Places methods. Vercel outbound addresses are dynamic by default; Static IP adds cost and routes project outbound traffic through the add-on. Any fallback requires a separate security and cost approval.

### Browser key

Rejected. The first release is a server-to-server integration. No Google credential may be exposed in client code, browser storage, or network requests from the browser.

## Verification required in Phase 6C-1

After this document and the legal updates are approved, Phase 6C-1 may implement a disabled-by-default provider boundary. Its authentication proof must use synthetic, non-sensitive input and confirm:

1. Production identity cannot be obtained from Preview.
2. Preview identity cannot impersonate the Production service account.
3. A valid environment-bound identity can obtain a short-lived access token with only the required Places scope.
4. Text Search and Place Details reject a token with the wrong scope.
5. No API key or service-account private key exists in the repository, Vercel variables, browser bundle, logs, screenshots, or test artifacts.
6. Token exchange failure produces a safe SafrBwai error and zero fabricated hotel results.
7. Provider calls remain impossible while the server capability is disabled.

No real provider request belongs in this documentation PR.

## Approval gate

Phase 6C-1 remains blocked until both are approved:

- [ ] This OIDC federation design.
- [ ] The accompanying Arabic and English Privacy and Terms updates.

Approval of this PR permits only the next implementation review. It does not enable Google Places API (New), create credentials, add Vercel variables, activate hotel search, change `ProductStage`, remove `noindex, nofollow`, or start a public launch.

## Official references

- [Vercel OpenID Connect Federation](https://vercel.com/docs/oidc)
- [Vercel: Connect to Google Cloud Platform](https://vercel.com/docs/oidc/gcp)
- [Google Cloud: Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Google Cloud: Workload Identity Federation best practices](https://cloud.google.com/iam/docs/best-practices-for-using-workload-identity-federation)
- [Google Maps Platform security guidance](https://developers.google.com/maps/api-security-best-practices)
- [Places API (New) setup and authentication](https://developers.google.com/maps/documentation/places/web-service/get-api-key)
- [Text Search (New) authorization scopes](https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places/searchText)
- [Place Details (New) authorization scopes](https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places/get)
