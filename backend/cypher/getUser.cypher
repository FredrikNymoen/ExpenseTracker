MATCH (u:User {id: $id})
RETURN u {.id, .name, .balance, .riskScore, createdAt: toString(u.createdAt)} AS user