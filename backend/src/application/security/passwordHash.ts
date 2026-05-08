import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedPasswordHash: string): boolean {
  const [salt, hash] = storedPasswordHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const storedHash = Buffer.from(hash, "hex");
  const incomingHash = scryptSync(password, salt, 64);

  return storedHash.length === incomingHash.length && timingSafeEqual(storedHash, incomingHash);
}
