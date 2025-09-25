MATCH (u:User {id: $id})

// Sent transactions (motpart kan være slettet)
CALL (u) {
  WITH u
  MATCH (u)-[:SENT]->(t:Transaction)
  OPTIONAL MATCH (t)-[:RECEIVED_BY]->(r:User)
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
      to:
        CASE
          WHEN r IS NULL THEN {id: null, name: "Deleted User", img: null}
          ELSE {id: r.id, name: r.name, img: r.img}
        END
    }) AS sent
}

// Received transactions (avsender kan være slettet)
CALL (u) {
  WITH u
  MATCH (t2:Transaction)-[:RECEIVED_BY]->(u)
  OPTIONAL MATCH (s:User)-[:SENT]->(t2)
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
      from:
        CASE
          WHEN s IS NULL THEN {id: null, name: "Deleted User", img: null}
          ELSE {id: s.id, name: s.name, img: s.img}
        END
    }) AS received
}

WITH sent + received AS allTx
UNWIND allTx AS item
WITH item
ORDER BY datetime(item.tx.date) DESC
RETURN collect(item) AS transactions;