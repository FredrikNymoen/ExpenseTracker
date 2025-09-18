MATCH (u:User {id: $id})
DETACH DELETE u
RETURN count(u) AS deletedCount