const TOKEN_EXPIRY_MS = 5 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.REQUEST_TOKEN_SECRET;
  if (!secret) {
    throw new Error("REQUEST_TOKEN_SECRET environment variable is required");
  }
  return secret;
}

function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...arr));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUint8Array(str: string): Uint8Array {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    arr[i] = binary.charCodeAt(i);
  }
  return arr;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

async function createSignature(timestamp: string): Promise<string> {
  const secretBytes = stringToUint8Array(getSecret());
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const timestampBytes = stringToUint8Array(timestamp);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    timestampBytes.buffer as ArrayBuffer
  );

  return uint8ArrayToBase64Url(new Uint8Array(signature));
}

export async function generateToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const signature = await createSignature(timestamp);
  const encodedTimestamp = uint8ArrayToBase64Url(stringToUint8Array(timestamp));
  return `${encodedTimestamp}.${signature}`;
}

export async function validateToken(token: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Token required" };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Invalid token format" };
  }

  const [encodedTimestamp, providedSignature] = parts;

  let timestamp: string;
  try {
    const decoded = base64UrlToUint8Array(encodedTimestamp);
    timestamp = new TextDecoder().decode(decoded);
  } catch {
    return { valid: false, error: "Invalid token format" };
  }

  try {
    const expectedSignature = await createSignature(timestamp);
    const sigBuffer = base64UrlToUint8Array(providedSignature);
    const expectedBuffer = base64UrlToUint8Array(expectedSignature);

    if (!timingSafeEqual(sigBuffer, expectedBuffer)) {
      return { valid: false, error: "Invalid token signature" };
    }
  } catch {
    return { valid: false, error: "Invalid token signature" };
  }

  const tokenTime = parseInt(timestamp, 10);
  if (isNaN(tokenTime)) {
    return { valid: false, error: "Invalid token format" };
  }

  if (Date.now() - tokenTime > TOKEN_EXPIRY_MS) {
    return { valid: false, error: "Token expired" };
  }

  return { valid: true };
}
