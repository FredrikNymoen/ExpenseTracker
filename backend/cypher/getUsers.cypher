MATCH (u:User)
RETURN u {
  .id,
  .cognito_sub,
  .name,
  .balance,
  .riskScore,
  .img,
  createdAt: toString(u.createdAt)
} AS user
ORDER BY u.createdAt DESC
LIMIT 50