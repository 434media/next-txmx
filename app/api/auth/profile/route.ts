import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "firebase-admin/auth"
import { getOrCreateUser } from "../../../actions/users"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.slice(7)

  try {
    const decoded = await getAuth().verifyIdToken(token)
    // `decoded.name` / `decoded.picture` are standard Firebase profile fields
    // populated when the user signed in via a provider (Google) or after an
    // updateProfile() call. Walk-in guests sign in with a custom token whose
    // claims include `displayName` — fall through to that so their name lands
    // on the users doc on this very first call (instead of waiting for a
    // backfill on the next getOrCreateUser write).
    const customDisplayName =
      typeof decoded.displayName === "string" ? decoded.displayName : null
    const user = await getOrCreateUser(
      decoded.uid,
      decoded.email || null,
      decoded.name || customDisplayName || null,
      decoded.picture || null
    )

    return NextResponse.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      subscriptionStatus: user.subscriptionStatus,
      gymPledge: user.gymPledge,
      gymPledgeLockedUntil: user.gymPledgeLockedUntil,
      skillPoints: user.skillPoints,
      txCredits: user.txCredits,
      loyaltyPoints: user.loyaltyPoints,
      rank: user.rank,
      isVerified: user.isVerified ?? false,
      legacyRank: user.legacyRank ?? null,
    })
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
