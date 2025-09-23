MATCH (u:User {id: $id})

// Sent transactions
CALL (u) {
  WITH u
  MATCH (u)-[:SENT]->(t:Transaction)-[:RECEIVED_BY]->(r:User)
  RETURN
    collect({
      role: 'sent',
      tx: {
        id: t.id,
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: toString(t.date)
      },
      to: {id: r.id, name: r.name}
    }) AS sent
}

// Received transactions
CALL (u) {
  WITH u
  MATCH (s:User)-[:SENT]->(t2:Transaction)-[:RECEIVED_BY]->(u)
  RETURN
    collect({
      role: 'received',
      tx: {
        id: t2.id,
        amount: t2.amount,
        category: t2.category,
        description: t2.description,
        date: toString(t2.date)
      },
      from: {id: s.id, name: s.name}
    }) AS received
}

WITH sent + received AS allTx
UNWIND allTx AS item
WITH item
ORDER BY datetime(item.tx.date) DESC
RETURN collect(item) AS transactions