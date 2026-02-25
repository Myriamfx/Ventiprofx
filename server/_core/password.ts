import { createHash } from "crypto";

// Very simple password hashing using SHA256; not suitable for production but
// good enough for demonstration and unit tests. In a real app you'd use bcrypt
// or scrypt with a per-user salt.

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  return hashPassword(password) === storedHash;
}
