MATCH (u:User { cognitoSub: $cognitoSub })
RETURN u { .* } AS user