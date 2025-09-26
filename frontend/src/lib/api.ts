export interface User {
  id: string;
  cognitoSub: string;
  name: string;
  balance: number;
  riskScore: string;
  img: string;
  role?: string;
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
  to?: { id: string; name: string; img: string };
  from?: { id: string; name: string; img: string };
}

export interface CreateTransactionRequest {
  receiverId: string;
  amount: number;
  description?: string;
  category?: string;
}

export interface CreateTransactionResponse {
  sender: User;
  receiver: User;
  transaction: {
    id: string;
    amount: number;
    description: string;
    date: string;
    category: string;
  };
}

async function fetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${path}`, init);
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

export async function getUserTransactions(
  userId: string
): Promise<Transaction[]> {
  return fetchJson<Transaction[]>(`/transactions/user/${userId}`);
}

export async function getAllUsers(): Promise<User[]> {
  return fetchJson<User[]>("/users");
}

export async function createTransaction(
  token: string,
  data: CreateTransactionRequest
): Promise<CreateTransactionResponse> {
  return fetchJson<CreateTransactionResponse>("/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export interface PatchUserRequest {
  img?: string;
  name?: string;
  // riskScore is now automatically calculated, not manually set
}

export async function patchUser(
  token: string,
  data: PatchUserRequest
): Promise<User> {
  return fetchJson<User>("/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function getUserByCognitoSub(cognitoSub?: string): Promise<User> {
  return fetchJson<User>(`/users/cognito/${cognitoSub}`);
}

export async function deleteMe(token: string): Promise<{ message: string }> {
  return fetchJson<{ message: string }>("/me", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function changePassword(
  token: string,
  newPassword: string
): Promise<{ message: string }> {
  return fetchJson<{ message: string }>("/me/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword }),
  });
}

export async function recalculateRiskScore(
  token: string
): Promise<{ message: string; user: User; newRiskScore: string }> {
  return fetchJson<{ message: string; user: User; newRiskScore: string }>(
    "/me/recalculate-risk",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function claimBonus(
  token: string
): Promise<{ message: string; user: User; transaction: any; amount: number }> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/me/claim-bonus`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

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

  // Sjekk for success field i response (for cooldown-håndtering)
  if (json.success === false) {
    throw new Error(json.error || "Failed to claim bonus");
  }

  return json;
}

export async function checkBonusAvailability(
  token: string
): Promise<{ available: boolean; message: string }> {
  return fetchJson<{ available: boolean; message: string }>("/me/bonus-availability", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
