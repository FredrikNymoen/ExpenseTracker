MATCH (u:User)
RETURN u {.id, .name, .balance, .riskScore, createdAt: toString(u.createdAt)} AS user
ORDER BY u.createdAt DESC
LIMIT 50