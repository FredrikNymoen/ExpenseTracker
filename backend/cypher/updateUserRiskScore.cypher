MATCH (u:User {id: $userId})
SET u.riskScore = $riskScore
RETURN {
  id: u.id,
  cognitoSub: u.cognitoSub,
  name: u.name,
  balance: u.balance,
  riskScore: u.riskScore,
  createdAt: toString(u.createdAt),
  img: u.img
} AS user;