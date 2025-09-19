MERGE (u:User { cognitoSub: $cognitoSub })
ON CREATE SET
  u.id        = randomUUID(),
  u.name      = $name,
  u.balance   = $balance,
  u.riskScore = 'low',
  u.createdAt = timestamp()
RETURN {
  id: u.id,
  cognitoSub: u.cognitoSub,
  name: u.name,
  balance: u.balance,
  riskScore: u.riskScore
} AS user;
