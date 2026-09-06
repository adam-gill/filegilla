import { prisma } from "./prisma";
import bcrypt from "bcrypt";
import { apiKey, cliItem } from "@/prisma/generated/client";

const DEFAULT_API_KEY_ID = "cb7c658b-2660-4d9c-ad22-b5dda0875d53";

// A structurally-valid bcrypt hash used to keep the comparison time constant
// when the requested key id doesn't exist. Any string that parses as bcrypt
// will do; this one was generated with cost 10 against random input.
const DUMMY_BCRYPT_HASH =
  "$2b$10$abcdefghijklmnopqrstuuP9HGsF3qfBOEtE5Z6Q8R0sJ7mWk5KXe";

type AuthSuccess = {
  authenticated: true;
  apiKey: apiKey;
};

type AuthFailure = {
  authenticated: false;
};

type AuthResult = AuthSuccess | AuthFailure;

export const authenticateApiKey = async (
  apiKeySecret: string | null,
  apiKeyId: string | null,
): Promise<AuthResult> => {
  if (!apiKeySecret) {
    return { authenticated: false };
  }

  const keyId = apiKeyId ?? DEFAULT_API_KEY_ID;

  const apiKeyDB = await prisma.apiKey.findUnique({
    where: { id: keyId },
  });

  // Constant-time compare: always run bcrypt even if the key id is unknown,
  // so an attacker can't distinguish "key id doesn't exist" from "wrong secret"
  // by response time.
  const hashToCompare = apiKeyDB?.hash ?? DUMMY_BCRYPT_HASH;
  const hashIsValid = await bcrypt.compare(apiKeySecret, hashToCompare);

  if (!apiKeyDB || !hashIsValid) {
    return { authenticated: false };
  }

  return { authenticated: true, apiKey: apiKeyDB };
};

type AuthorizationResult =
  | { found: true; cliItem: cliItem; authorized: boolean }
  | { found: false };

export const authorizeCliItem = async (
  userId: string,
  cliItemId: string,
): Promise<AuthorizationResult> => {
  const item = await prisma.cliItem.findUnique({
    where: { id: cliItemId },
  });

  if (!item) {
    return { found: false };
  }

  return {
    found: true,
    cliItem: item,
    authorized: item.ownerId === userId,
  };
};

export const isCliNameTaken = async (id: string): Promise<boolean> => {
  const cliItem = await prisma.cliItem.findUnique({
    where: { id },
    select: { id: true },
  });

  return cliItem !== null;
};

const SALT_LENGTH = 16;

const generateKey = async (
  key: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 600000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
};

const encrypt = async (text: string, password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const key = await generateKey(password, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedContent = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    data,
  );

  const encryptedContentArray = new Uint8Array(encryptedContent);
  const resultArray = new Uint8Array(
    salt.length + iv.length + encryptedContentArray.length,
  );
  resultArray.set(salt, 0);
  resultArray.set(iv, salt.length);
  resultArray.set(encryptedContentArray, salt.length + iv.length);

  return btoa(
    String.fromCharCode.apply(null, resultArray as unknown as number[]),
  );
};

const decrypt = async (
  encryptedText: string,
  password: string,
): Promise<string> => {
  const encryptedData = Uint8Array.from(atob(encryptedText), (c) =>
    c.charCodeAt(0),
  );
  const salt = new Uint8Array(encryptedData.slice(0, SALT_LENGTH));
  const iv = new Uint8Array(encryptedData.slice(SALT_LENGTH, SALT_LENGTH + 12));
  const data = new Uint8Array(encryptedData.slice(SALT_LENGTH + 12));

  const key = await generateKey(password, salt);

  const decryptedContent = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    data,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedContent);
};

export class CliOperationError extends Error {
  readonly code: "INVALID_INPUT" | "OPERATION_FAILED";
  readonly operation: "encrypt" | "decrypt";

  constructor(
    code: "INVALID_INPUT" | "OPERATION_FAILED",
    operation: "encrypt" | "decrypt",
    message: string,
  ) {
    super(message);
    this.name = "CliOperationError";
    this.code = code;
    this.operation = operation;
  }
}

export const handleOperation = async (
  operation: "encrypt" | "decrypt",
  key: string,
  text: string,
) => {
  if (!key || !text) {
    throw new CliOperationError(
      "INVALID_INPUT",
      operation,
      `Please provide both a key and text to ${operation}.`,
    );
  }

  try {
    let operationResult;
    if (operation === "encrypt") {
      operationResult = await encrypt(text, key);
    } else {
      operationResult = await decrypt(text, key);
    }

    return operationResult;
  } catch {
    throw new CliOperationError(
      "OPERATION_FAILED",
      operation,
      `${
        operation.charAt(0).toUpperCase() + operation.slice(1)
      }ion failed. Please try again.`,
    );
  }
};
