MATCH (u:User { cognitoSub: $cognitoSub })

// Marker at denne brukeren kan få bonus
MERGE (sb:SignupBonus { userId: u.id })
ON CREATE SET sb.amount = $amount, sb.createdAt = datetime(), sb.applied = false
WITH u, sb

CALL {
  WITH u, sb
  WITH u, sb WHERE coalesce(sb.applied, false) = false

  // hent admin-brukeren
  MATCH (admin:User { role: "admin" })
  WITH u, sb, admin, randomUUID() AS txId

  CREATE (t:Transaction {
    id: txId,
    amount: $amount,
    category: "Signup Bonus",
    description: "Welcome to ExpenseTracker! Here is your signup bonus of 300kr.",
    date: datetime()
  })
  MERGE (admin)-[:SENT]->(t)
  MERGE (t)-[:RECEIVED_BY]->(u)

  // Oppdater balanse: kun mottaker får +300, admin beholdes som "uendelig"
  SET u.balance = coalesce(u.balance, 0) + $amount,
      sb.applied = true

  RETURN t
}

RETURN u { .* } AS user
