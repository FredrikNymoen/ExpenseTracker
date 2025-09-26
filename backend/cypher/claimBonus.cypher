MATCH (u:User { cognitoSub: $cognitoSub })

// Sjekk om brukeren har krevd bonus de siste 1 dagen
OPTIONAL MATCH (u)<-[:RECEIVED_BY]-(lastBonusTx:Transaction)
WHERE lastBonusTx.category = "Bonus"
AND lastBonusTx.date > datetime() - duration('P1D')

// Hvis det finnes en bonus transaksjon innen 1 dag, returner ingenting (cooldown aktiv)
WITH u, lastBonusTx
WHERE lastBonusTx IS NULL

// Hent admin-brukeren
MATCH (admin:User { role: "admin" })
WITH u, admin, randomUUID() AS txId

// Opprett bonus-transaksjon
CREATE (t:Transaction {
  id: txId,
  amount: $amount,
  category: "Bonus",
  description: "Daily bonus claim - 100kr from ExpenseTracker!",
  date: datetime()
})

// Koble transaksjonen
MERGE (admin)-[:SENT]->(t)
MERGE (t)-[:RECEIVED_BY]->(u)

// Oppdater brukerens balanse
SET u.balance = coalesce(u.balance, 0) + $amount

RETURN u { .* } AS user, t { .* } AS transaction