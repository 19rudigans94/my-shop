import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const ENCRYPTED_PREFIX_REGEX = /^[0-9a-f]{32}:[0-9a-f]{32}:[0-9a-f]+$/i;

function getKey() {
  const key = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("CREDENTIAL_ENCRYPTION_KEY не задан в переменных окружения");
  }
  return Buffer.from(key, "hex");
}

export function encryptCredential(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

// Backward-compatible: если строка не в зашифрованном формате — возвращает как есть
export function decryptCredential(text) {
  if (!ENCRYPTED_PREFIX_REGEX.test(text)) {
    return text;
  }
  try {
    const [ivHex, authTagHex, encryptedHex] = text.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return text;
  }
}

export function isEncryptionAvailable() {
  return !!process.env.CREDENTIAL_ENCRYPTION_KEY;
}
