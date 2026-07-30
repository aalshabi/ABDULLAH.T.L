# SafrBwai Closed Beta Runbook

## Purpose and scope

This runbook governs the closed Beta for SafrBwai.

- Supported input: travel-offer text only.
- Supported interface languages: Arabic and English.
- Unsupported inputs: PDF files, images, and links. They must remain disabled and must not reach the analysis API.
- Feedback collection remains disabled until durable storage is available.
- Search indexing remains disabled with `noindex, nofollow`.

## Pre-release smoke test

Run this checklist against the intended deployment without changing project settings:

1. Open the home page and confirm it loads normally.
2. Open `/analyze-offer` and confirm the closed-Beta notice appears before the form.
3. Analyze a synthetic Arabic text offer and confirm a result appears.
4. Analyze a synthetic English text offer and confirm a result appears.
5. Copy the suggested questions and confirm the copied text contains no offer text, evidence, priority, or request ID.
6. Copy the summary and confirm missing information is separate from confirmed facts.
7. Open `/privacy`.
8. Open `/terms`.
9. Confirm `POST /api/feedback` returns HTTP `503` with `FEEDBACK_DISABLED`.
10. Confirm the apex domain redirects to `https://www.safrbwai.com`.
11. Confirm `noindex, nofollow` remains present.
12. Confirm there are no visible JavaScript errors during the flow.

## Rate limiting and WAF

- Protected route: `/api/offer/analyze`
- Method: `POST`
- Limit: 10 requests per IP address per 60 seconds
- Expected limit response: HTTP `429`

A `429` may be produced by the WAF or by the application. Do not attribute its source unless the response headers have been inspected. The interface must show only the safe localized rate-limit message and must never display a raw edge response body.

## Rollback

If a release must be rolled back:

1. Open the SafrBwai project in the Vercel dashboard.
2. Identify the last successful production deployment that passed the smoke test.
3. Use the dashboard rollback/promote control to restore that deployment.
4. Repeat the production smoke test above.
5. Record the incident, affected deployment, rollback deployment, and verification result.

Do not delete deployments, change DNS records, change Domains, or modify Environment Variables as part of rollback.

## Data and logging restrictions

Never place any of the following in application logs, incident notes, feedback classification, test reports, or support tickets:

- offer text or excerpts from it;
- evidence extracted from the offer;
- people’s names;
- phone numbers or email addresses;
- payment or financial information;
- private URLs;
- uploaded filenames;
- an IP address in an application payload;
- full feedback text in logs.

Use synthetic or anonymized fixtures for every reproduction. A Request ID may be recorded only as an operational correlation identifier.

## Feedback classification

Classify a report using one or more of these labels, without retaining the original offer text:

- `missed_fact`
- `wrong_fact`
- `irrelevant_question`
- `missing_question`
- `contradiction`
- `locale_issue`
- `formatting_issue`
- `usability_issue`

## Stop-Beta criteria

Pause new Beta usage when any of the following occurs:

- personal, payment, or other sensitive data appears in logs or telemetry;
- offer text or evidence is retained outside the active request;
- analysis returns unsafe raw errors, stack traces, or infrastructure details;
- the analysis endpoint becomes broadly unavailable or repeatedly exceeds its expected error rate;
- rate limiting or abuse controls are not operating as expected;
- a confirmed high-severity security issue affects the production path;
- unsupported PDF, image, or link input becomes active or reaches the API;
- results materially misrepresent missing information as confirmed facts;
- rollback cannot be completed safely from the Vercel dashboard.

## Incident response

1. Pause the cohort and stop accepting new test cases.
2. Record the time, deployment, affected route, safe Request ID if available, and symptom without copying offer content.
3. Determine whether the issue is application behavior, rate limiting, WAF behavior, or deployment availability using status and headers only.
4. If user data exposure is suspected, preserve only non-sensitive operational evidence and escalate immediately.
5. Roll back to the last successful deployment when the current deployment is unsafe or unavailable.
6. Repeat the smoke test, document the result, and resume only after the stop-Beta condition is cleared.

## First cohort

- Invite 10 users.
- Review no more than 50 text offers in the first cohort.
- Tell participants not to use personal, confidential, payment-related, or secret offers.
- Classify feedback without storing or reproducing the original offer text.
- Use only synthetic or anonymized fixtures for defects and regression tests.
