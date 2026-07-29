# Beta Feedback Storage Decision

## Status

Pending approval for durable collection.

SafrBwai currently has application-level Supabase configuration, but the repository does not contain an approved feedback table, migration, retention policy, access policy, or telemetry integration for Beta feedback. Existing configuration alone is not authorization to create or write a new dataset.

## Current implementation

- `FeedbackStore` is the only persistence boundary used by the feedback API.
- `InMemoryFeedbackStore` is used only in development and tests.
- `DisabledFeedbackStore` is used in production until a durable provider is approved.
- No credentials or external services are introduced.
- `NEXT_PUBLIC_BETA_FEEDBACK_ENABLED` and `BETA_FEEDBACK_ENABLED` default to `false`.
- The UI is absent and the API returns `503 FEEDBACK_DISABLED` while collection is disabled.
- A success response is returned only after a store reports `{ stored: true }`.

Durable aggregation must be approved and configured before the actual closed Beta begins.

## Data contract

The store accepts only:

- `requestId`, when available
- `feedback`: `helpful` or `not_helpful`
- optional `reasonCode`
- optional cleaned `comment`, limited to 300 characters
- `locale`
- `sourceType`
- server-generated `timestamp`
- `schemaVersion`

The contract rejects unknown fields. It must never accept offer text, extracted evidence, analysis results, names, email addresses, phone numbers, file names, URLs, payment data, or an IP address.

## Options

### Option A — Supabase table

Use the existing application provider after approval, with a dedicated table, server-only insert path, strict row-level security, an explicit retention window, and restricted reporting access.

- Cost: likely within the existing plan at low Beta volume; confirm current plan limits.
- Benefits: durable querying and a provider already configured for the application.
- Risks: accidental client access, indefinite retention, schema drift, or linking feedback to account data.
- Required before use: reviewed migration, retention decision, access policy, deletion procedure, and production environment verification.

### Option B — Managed key-value or serverless database

Add a separate managed store behind `FeedbackStore`.

- Cost: often low at Beta volume, but creates a new billing and operational dependency.
- Benefits: simple write path and independent lifecycle.
- Risks: new credentials, vendor access, regional data handling, retention defaults, and additional incident surface.
- Required before use: explicit provider approval, pricing review, data-location review, secret management, retention, and deletion procedure.

### Option C — Approved first-party database

Persist through an existing first-party database only if it has a reviewed server-side connection and suitable isolation.

- Cost: incremental database usage and operational maintenance.
- Benefits: consolidated access control and reporting.
- Risks: feedback may become linkable to unrelated user or transaction data.
- Required before use: isolated schema or table, least-privilege credentials, retention, and access review.

## Recommendation

Keep `DisabledFeedbackStore` in production until Option A or C is explicitly approved with retention and access controls. Option A is the shortest implementation path if the existing provider is approved for this dataset. Do not add a new paid provider solely for Beta feedback without a separate decision.

## Operational safeguards

- The API has its own rate limiter and request-body cap.
- The server rejects feedback before reading the payload when its feature flag is disabled.
- Only schema-approved fields reach `FeedbackStore`.
- The caller address may be used ephemerally as a rate-limit key but is never included in the payload or stored record.
- Error logging contains only operational metadata and never the comment.
- Storage failure affects only feedback submission; it does not alter or remove the analysis result.
- Disabled storage never produces a success message.
- No offer content is sent to an external service.
