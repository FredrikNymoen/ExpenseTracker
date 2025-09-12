MATCH (sender:User {id: $senderId})
MATCH (receiver:User {id: $receiverId})
WITH sender, receiver, randomUUID() AS txId
CREATE
  (t:Transaction
    {
      id: txId,
      amount: $amount,
      category: $category,
      description: $description,
      date: datetime()
    })
MERGE (sender)-[:SENT]->(t)
MERGE (t)-[:RECEIVED_BY]->(receiver)
SET
  sender.balance = coalesce(sender.balance, 0) - $amount,
  receiver.balance = coalesce(receiver.balance, 0) + $amount
RETURN
  sender {.id, .name, .balance} AS sender,
  receiver {.id, .name, .balance} AS receiver,
  t {.id, .amount, .category, .description, date: toString(t.date)} AS transaction