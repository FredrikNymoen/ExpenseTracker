MATCH (u:User {id: $userId})
SET
  u.img = coalesce($img, u.img),
  u.name = coalesce($name, u.name),
  u.riskScore = coalesce($riskScore, u.riskScore)
RETURN {
  id: u.id,
  cognitoSub: u.cognitoSub,
  name: u.name,
  balance: u.balance,
  riskScore: u.riskScore,
  createdAt: toString(u.createdAt),
  img: u.img
} AS user;