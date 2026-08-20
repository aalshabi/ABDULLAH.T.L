import { describe, expect, it, vi } from "vitest";
import {
  GOOGLE_PLACE_DETAILS_SCOPE,
  GOOGLE_TEXT_SEARCH_SCOPE,
} from "./constants";
import {
  readGoogleOidcConfig,
  isServerHotelIdentityLookupEnabled,
  type GoogleOidcConfig,
} from "./config";
import {
  buildExternalAccountOptions,
  createVercelGoogleAccessTokenProvider,
  type GoogleAuthDependencies,
} from "./auth";
import { HotelProviderError } from "./errors";

const ENV = {
  VERCEL_ENV: "preview",
  VERCEL_PROJECT_ID: "prj_123456",
  VERCEL_TEAM_ID: "team_123456",
  GCP_PROJECT_NUMBER: "123456789012",
  GCP_WORKLOAD_IDENTITY_POOL_ID: "safrbwai-preview",
  GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID: "vercel-preview",
  GCP_SERVICE_ACCOUNT_EMAIL: "safrbwai-preview@example-project.iam.gserviceaccount.com",
} as const;

function config(environment: "preview" | "production" = "preview"): GoogleOidcConfig {
  return readGoogleOidcConfig({ ...ENV, VERCEL_ENV: environment });
}

function dependencies(
  identityEnvironment: "preview" | "production" = "preview"
): GoogleAuthDependencies & {
  getOidcToken: ReturnType<typeof vi.fn>;
  verifyOidcToken: ReturnType<typeof vi.fn>;
  createExternalClient: ReturnType<typeof vi.fn>;
} {
  return {
    getOidcToken: vi.fn().mockResolvedValue("SIGNED_VERCEL_OIDC_TOKEN"),
    verifyOidcToken: vi.fn().mockResolvedValue({
      payload: {
        sub: `owner:abdullah-shabis-projects:project:safrbwai:environment:${identityEnvironment}`,
        environment: identityEnvironment,
      },
    }),
    createExternalClient: vi.fn().mockReturnValue({
      getAccessToken: vi.fn().mockResolvedValue({ token: "SHORT_LIVED_GOOGLE_TOKEN" }),
    }),
  };
}

describe("hotel provider configuration", () => {
  it("is fail-closed unless the server flag is the literal value true", () => {
    expect(isServerHotelIdentityLookupEnabled(undefined)).toBe(false);
    expect(isServerHotelIdentityLookupEnabled("TRUE")).toBe(false);
    expect(isServerHotelIdentityLookupEnabled("1")).toBe(false);
    expect(isServerHotelIdentityLookupEnabled("true")).toBe(true);
  });

  it("builds an environment-bound OIDC configuration", () => {
    expect(config()).toMatchObject({
      environment: "preview",
      expectedSubject:
        "owner:abdullah-shabis-projects:project:safrbwai:environment:preview",
      issuer: "https://oidc.vercel.com/abdullah-shabis-projects",
      audience: "https://vercel.com/abdullah-shabis-projects",
    });
  });

  it.each([
    { ...ENV, VERCEL_ENV: "development" },
    { ...ENV, GCP_PROJECT_NUMBER: "not-a-number" },
    { ...ENV, GCP_WORKLOAD_IDENTITY_POOL_ID: "../unsafe" },
    { ...ENV, GCP_SERVICE_ACCOUNT_EMAIL: "not-an-account" },
    { ...ENV, VERCEL_PROJECT_ID: "wrong" },
  ])("rejects incomplete or unsafe configuration %#", (candidate) => {
    expect(() => readGoogleOidcConfig(candidate)).toThrowError(HotelProviderError);
  });
});

describe("Vercel OIDC to Google access-token boundary", () => {
  it("requests only the exact Text Search scope with fixed Google endpoints", async () => {
    const deps = dependencies();
    const provider = createVercelGoogleAccessTokenProvider(config(), deps);

    await expect(provider.getAccessToken(GOOGLE_TEXT_SEARCH_SCOPE)).resolves.toBe(
      "SHORT_LIVED_GOOGLE_TOKEN"
    );
    expect(deps.verifyOidcToken).toHaveBeenCalledWith(
      "SIGNED_VERCEL_OIDC_TOKEN",
      config()
    );
    const options = deps.createExternalClient.mock.calls[0][0];
    expect(options).toMatchObject({
      token_url: "https://sts.googleapis.com/v1/token",
      scopes: [GOOGLE_TEXT_SEARCH_SCOPE],
      service_account_impersonation: { token_lifetime_seconds: 600 },
    });
    expect(options.service_account_impersonation_url).toBe(
      "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/safrbwai-preview%40example-project.iam.gserviceaccount.com:generateAccessToken"
    );
    expect(JSON.stringify(options)).not.toContain("PRIVATE KEY");
  });

  it("keeps Place Details on its distinct least-privilege scope", () => {
    expect(
      buildExternalAccountOptions(config(), GOOGLE_PLACE_DETAILS_SCOPE, async () => "token")
        .scopes
    ).toEqual([GOOGLE_PLACE_DETAILS_SCOPE]);
  });

  it("rejects a Preview identity for Production before Google exchange", async () => {
    const deps = dependencies("preview");
    const provider = createVercelGoogleAccessTokenProvider(config("production"), deps);

    await expect(provider.getAccessToken(GOOGLE_TEXT_SEARCH_SCOPE)).rejects.toMatchObject({
      code: "PROVIDER_AUTH",
    });
    expect(deps.createExternalClient).not.toHaveBeenCalled();
  });

  it("rejects a Production identity for Preview before Google exchange", async () => {
    const deps = dependencies("production");
    const provider = createVercelGoogleAccessTokenProvider(config("preview"), deps);

    await expect(provider.getAccessToken(GOOGLE_TEXT_SEARCH_SCOPE)).rejects.toMatchObject({
      code: "PROVIDER_AUTH",
    });
    expect(deps.createExternalClient).not.toHaveBeenCalled();
  });

  it("rejects broad or unknown scopes before obtaining an OIDC token", async () => {
    const deps = dependencies();
    const provider = createVercelGoogleAccessTokenProvider(config(), deps);

    await expect(
      provider.getAccessToken("https://www.googleapis.com/auth/cloud-platform")
    ).rejects.toMatchObject({ code: "PROVIDER_CONFIG" });
    expect(deps.getOidcToken).not.toHaveBeenCalled();
  });

  it("normalizes token exchange failures without leaking the upstream error", async () => {
    const deps = dependencies();
    deps.createExternalClient.mockReturnValue({
      getAccessToken: vi.fn().mockRejectedValue(new Error("RAW_STS_PRIVATE_ERROR")),
    });
    const provider = createVercelGoogleAccessTokenProvider(config(), deps);

    const failure = provider.getAccessToken(GOOGLE_TEXT_SEARCH_SCOPE);
    await expect(failure).rejects.toMatchObject({ code: "PROVIDER_AUTH" });
    await expect(failure).rejects.not.toThrow("RAW_STS_PRIVATE_ERROR");
  });
});
