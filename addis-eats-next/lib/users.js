// Hardcoded accounts — there's still no real database or user table.
// Passwords are plain text on purpose: this file needs to stay readable
// for a class project, and nothing here is a real credential. Swap this
// for a real users table with hashed passwords before this ever talks to
// a real customer.
const USERS = [
  { id: "u_almaz", email: "almaz@addiseats.com", password: "almaz123", role: "customer", name: "Almaz" },
  { id: "u_bereket", email: "bereket@addiseats.com", password: "bereket123", role: "customer", name: "Bereket" },
  { id: "u_staff", email: "staff@addiseats.com", password: "staff123", role: "staff", name: "Kitchen Staff" },
  { id: "u_admin", email: "admin@addiseats.com", password: "admin123", role: "admin", name: "Admin" },
];

export function findUserByCredentials(email, password) {
  const normalized = String(email ?? "").trim().toLowerCase();
  return USERS.find((u) => u.email === normalized && u.password === password) ?? null;
}
