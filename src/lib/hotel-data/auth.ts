import { getVercelOidcToken, verifyVercelOidcToken } from "@vercel/oidc";
import {
  ExternalAccountClient,
  type ExternalAccountClientOptions,
} from "google-auth-library";
import {
  APPROVED_GOOGLE_PLACES_SCOPES,
} from "./constants";
import {
  VERCEL_PROJECT_NAME,
  VERCEL_TEAM_SLUG,
  type GoogleOidcConfig,
} from "./config";
import { HotelProviderError } from "./errors";
import type { GoogleAccessTokenProvider } from "./types";

type VerifiedIdentity = Readonly<{
  payload: Readonly<{ sub?: string; environment?: string }>;
}>;

type ExternalClient = Readonly<{
  getAccessToken(): Promise<{ token?: string | null }>;
}>;

export type GoogleAuthDependencies = Readonly<{
  getOidcToken: () => Promise<string>;
  verifyOidcToken: (token: string, config: GoogleOidcConfig) => Promise<VerifiedIdentity>;
  createExternalClient: (options: ExternalAccountClientOptions) => ExternalClient | null;
}>;

export function buildExternalAccountOptions(
  config: GoogleOidcConfig,
  scope: string,
  getSubjectToken: () => Promise<string>
): ExternalAccountClientOptions {
  return {
    type: "external_account",
    audience: `//iam.googleapis.com/projects/${config.projectNumber}/locations/global/workloadIdentityPools/${config.workloadIdentityPoolId}/providers/${config.workloadIdentityProviderId}`,
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    token_url: "https://sts.googleapis.com/v1/token",
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(config.serviceAccountEmail)}:generateAccessToken`,
    service_account_impersonation: { token_lifetime_seconds: 600 },
    scopes: [scope],
    subject_token_supplier: {
      getSubjectToken: async () => getSubjectToken(),
    },
  };
}

const DEFAULT_DEPENDENCIES: GoogleAuthDependencies = {
  getOidcToken: () =>
    getVercelOidcToken({ team: VERCEL_TEAM_SLUG, project: VERCEL_PROJECT_NAME }),
  verifyOidcToken: async (token, config) =>
    verifyVercelOidcToken(token, {
      audience: config.audience,
      environment: config.environment,
      issuer: config.issuer,
      ownerId: config.vercelTeamId,
      projectId: config.vercelProjectId,
    }),
  createExternalClient: (options) => ExternalAccountClient.fromJSON(options),
};

export function createVercelGoogleAccessTokenProvider(
  config: GoogleOidcConfig,
  dependencies: GoogleAuthDependencies = DEFAULT_DEPENDENCIES
): GoogleAccessTokenProvider {
  return {
    async getAccessToken(scope: string): Promise<string> {
      if (!APPROVED_GOOGLE_PLACES_SCOPES.has(scope)) {
        throw new HotelProviderError("PROVIDER_CONFIG");
      }

      try {
        const oidcToken = await dependencies.getOidcToken();
        const verified = await dependencies.verifyOidcToken(oidcToken, config);
        if (
          verified.payload.sub !== config.expectedSubject ||
          verified.payload.environment !== config.environment
        ) {
          throw new HotelProviderError("PROVIDER_AUTH");
        }

        const client = dependencies.createExternalClient(
          buildExternalAccountOptions(config, scope, async () => oidcToken)
        );
        if (!client) throw new HotelProviderError("PROVIDER_CONFIG");

        const accessToken = await client.getAccessToken();
        if (!accessToken.token) throw new HotelProviderError("PROVIDER_AUTH");
        return accessToken.token;
      } catch (error) {
        if (error instanceof HotelProviderError) throw error;
        throw new HotelProviderError("PROVIDER_AUTH");
      }
    },
  };
}
