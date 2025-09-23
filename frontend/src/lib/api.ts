export interface User {
  id: string;
  cognitoSub: string;
  name: string;
  balance: number;
  riskScore: string;
}

// Transaction interface based on your backend structure
export interface Transaction {
  role: "sent" | "received";
  tx: {
    id: string;
    amount: number;
    description: string;
    date: string;
    category: string;
  };
  to?: { id: string; name: string };
  from?: { id: string; name: string };
}

async function fetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`http://localhost:5000/api${path}`, init);
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!ct.includes("application/json")) {
    throw new Error(`Expected JSON, got ${ct}. Body: ${text.slice(0, 120)}`);
  }
  const json = JSON.parse(text);
  if (!res.ok) {
    const msg = json?.error || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return json as T;
}

export async function ensureMe(
  token: string,
  defaultName?: string
): Promise<User> {
  return fetchJson<User>("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(defaultName ? { "x-default-name": defaultName } : {}),
    },
  });
}


export async function getUserTransactions(userId: string) : Promise<Transaction[]> {
  return fetchJson<Transaction[]>(`/transactions/user/${userId}`);
}
