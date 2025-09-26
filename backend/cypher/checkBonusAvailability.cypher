MATCH (u:User {cognitoSub: $cognitoSub})
OPTIONAL MATCH (u)<-[:RECEIVED_BY]-(lastBonusTx:Transaction)
WHERE
  lastBonusTx.category = "Bonus" AND
  lastBonusTx.date > datetime() - duration('P1D')
RETURN lastBonusTx IS NULL AS canClaim