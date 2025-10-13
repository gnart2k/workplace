import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const algorithm = "aes-256-gcm";
const key = process.env.GITHUB_PAT_ENCRYPTION_KEY;
const ivLength = 16;

if (!key || key.length !== 32) {
  throw new Error(
    "GITHUB_PAT_ENCRYPTION_KEY must be a 32-byte string in the environment variables.",
  );
}

const encryptionKey = key as string;

export function encrypt(text: string): string {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv(algorithm, encryptionKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${encrypted}:${tag.toString("hex")}`;
}

export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  const tag = Buffer.from(parts[2], "hex");

  const decipher = createDecipheriv(algorithm, encryptionKey, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
