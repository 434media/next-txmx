import type { Credential } from 'firebase-admin/app'
import { Firestore } from 'firebase-admin/firestore'
import { ExternalAccountClient, type BaseExternalAccountClient } from 'google-auth-library'
import { getVercelOidcToken } from '@vercel/oidc'

// Keyless Google credentials: a service account reached through Vercel OIDC and
// Workload Identity Federation, so no key file exists. Vercel proves which
// project is calling (getVercelOidcToken), Google exchanges that for a
// short-lived token for the service account, and nothing long-lived is stored.
// Pattern: https://vercel.com/docs/oidc/gcp (as shipped in legacy-flight-academy).
//
// Keyless is on only when all five variables are set:
//   GCP_PROJECT_NUMBER, GCP_SERVICE_ACCOUNT_EMAIL, GCP_WORKLOAD_IDENTITY_POOL_ID,
//   GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID, FIREBASE_PROJECT_ID.
// Otherwise callers keep their GOOGLE_SERVICE_ACCOUNT_KEY path exactly as before,
// so deploying this changes nothing until those variables are added.

export function isKeyless(): boolean {
  return !!(
    process.env.GCP_PROJECT_NUMBER &&
    process.env.GCP_SERVICE_ACCOUNT_EMAIL &&
    process.env.GCP_WORKLOAD_IDENTITY_POOL_ID &&
    process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID &&
    process.env.FIREBASE_PROJECT_ID
  )
}

let externalClient: BaseExternalAccountClient | undefined

/** Workload Identity Federation client for the service account, fed by the Vercel OIDC token. */
function getExternalClient(): BaseExternalAccountClient {
  if (externalClient) return externalClient
  const providerPath =
    `iam.googleapis.com/projects/${process.env.GCP_PROJECT_NUMBER}` +
    `/locations/global/workloadIdentityPools/${process.env.GCP_WORKLOAD_IDENTITY_POOL_ID}` +
    `/providers/${process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`
  // STS wants the provider's resource name ('//iam.googleapis.com/...'); the Vercel
  // OIDC token is requested for the https form, one of the provider's allowed audiences.
  const audience = `//${providerPath}`
  const oidcAudience = `https://${providerPath}`
  const client = ExternalAccountClient.fromJSON({
    type: 'external_account',
    audience,
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    service_account_impersonation_url:
      `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/` +
      `${process.env.GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
    // Read per request, never at module load: on Vercel the token arrives in the
    // request (x-vercel-oidc-token) and is not available at build time.
    subject_token_supplier: { getSubjectToken: () => getVercelOidcToken({ audience: oidcAudience }) },
  })
  if (!client) throw new Error('Could not create the Workload Identity Federation client.')
  externalClient = client
  return client
}

/**
 * A firebase-admin credential backed by the federated client, for Firebase Auth.
 * Firestore cannot take a custom credential through firebase-admin (it accepts
 * only a key or Application Default Credentials), so keylessFirestore builds its
 * client with the same authClient instead.
 */
export const keylessCredential: Credential = {
  async getAccessToken() {
    const client = getExternalClient()
    const { token } = await client.getAccessToken()
    if (!token) throw new Error('Workload Identity Federation returned no access token.')
    const expiry = client.credentials?.expiry_date
    return {
      access_token: token,
      expires_in: expiry ? Math.max(0, Math.floor((expiry - Date.now()) / 1000)) : 300,
    }
  },
}

const keylessDbs = new Map<string, Firestore>()

/** Firestore on the keyless credential. Omit databaseId for the '(default)' database. */
export function keylessFirestore(databaseId?: string): Firestore {
  const id = databaseId ?? '(default)'
  let db = keylessDbs.get(id)
  if (!db) {
    db = new Firestore({
      projectId: process.env.FIREBASE_PROJECT_ID,
      ...(databaseId ? { databaseId } : {}),
      authClient: getExternalClient(),
    })
    keylessDbs.set(id, db)
  }
  return db
}
