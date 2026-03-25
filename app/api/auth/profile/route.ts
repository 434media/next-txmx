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
    const user = await getOrCreateUser(
      decoded.uid,
      decoded.email || null,
      decoded.name || null,
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
    })
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
