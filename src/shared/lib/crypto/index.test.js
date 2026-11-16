import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { encryptCredential, decryptCredential, isEncryptionAvailable } from "./index";

const KEY = "0".repeat(63) + "1"; // 32 байта в hex

beforeEach(() => vi.stubEnv("CREDENTIAL_ENCRYPTION_KEY", KEY));
afterEach(() => vi.unstubAllEnvs());

describe("шифрование учётных данных цифровых копий", () => {
  it("шифрует и расшифровывает обратно", () => {
    const enc = encryptCredential("user@psn.com");

    expect(enc).not.toContain("user@psn.com");
    expect(enc).toMatch(/^[0-9a-f]{32}:[0-9a-f]{32}:[0-9a-f]+$/);
    expect(decryptCredential(enc)).toBe("user@psn.com");
  });

  it("каждый раз даёт новый шифротекст (случайный IV)", () => {
    expect(encryptCredential("same")).not.toBe(encryptCredential("same"));
  });

  it("старые незашифрованные значения возвращает как есть", () => {
    expect(decryptCredential("plain-password")).toBe("plain-password");
  });

  it("с другим ключом не расшифровывает (возвращает исходную строку)", () => {
    const enc = encryptCredential("secret");
    vi.stubEnv("CREDENTIAL_ENCRYPTION_KEY", "f".repeat(64));

    expect(decryptCredential(enc)).toBe(enc);
  });

  it("без ключа шифрование недоступно и падает явно", () => {
    vi.stubEnv("CREDENTIAL_ENCRYPTION_KEY", "");

    expect(isEncryptionAvailable()).toBe(false);
    expect(() => encryptCredential("x")).toThrow(/CREDENTIAL_ENCRYPTION_KEY/);
  });
});
