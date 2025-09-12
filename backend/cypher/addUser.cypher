WITH randomUUID() AS id
CREATE
  (u:User
    {
      id: id,
      name: $name,
      riskScore: "low",
      balance: $balance,
      createdAt: datetime()
    })
RETURN u {.id, .name, .riskScore, .balance, createdAt: toString(u.createdAt)} AS user