export type AuthUser = {
  user_id: string;
  username: string;
  role: "admin" | "organizer" | "customer";
  organizer_id?: string;
};

type StoredUser = AuthUser & { password: string };

const USERS: StoredUser[] = [
  {
    user_id: "550e8400-e29b-41d4-a716-446655443001",
    username: "admin",
    password: "admin123",
    role: "admin",
  },
  {
    user_id: "550e8400-e29b-41d4-a716-446655443002",
    username: "organizer1",
    password: "org123",
    role: "organizer",
    organizer_id: "550e8400-e29b-41d4-a716-446655446001",
  },
  {
    user_id: "550e8400-e29b-41d4-a716-446655443003",
    username: "organizer2",
    password: "org456",
    role: "organizer",
    organizer_id: "550e8400-e29b-41d4-a716-446655446002",
  },
  {
    user_id: "550e8400-e29b-41d4-a716-446655443004",
    username: "customer1",
    password: "cust123",
    role: "customer",
  },
];

const KEY = "jeans_raqil_user";

export function login(username: string, password: string): AuthUser | null {
  const found = USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (!found) return null;
  const { password: _pw, ...authUser } = found;
  localStorage.setItem(KEY, JSON.stringify(authUser));
  return authUser;
}

export function logout(): void {
  localStorage.removeItem(KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}
