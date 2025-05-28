import crypto from "crypto";

export function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {

    crypto.scrypt(password.normalize(), salt, 64, (error, hash) => {
      if (error) reject(error);
      resolve(hash.toString("hex").normalize());
    });
  })
};

export function generateSalt() {
  return crypto.randomBytes(16).toString("hex").normalize();
}

export async function verifyPassword(
  {password, salt, hashedPassword}: {password: string; salt: string; hashedPassword: string}
): Promise<boolean> {
  const hashedInputPassword = await hashPassword(password, salt);
  return crypto.timingSafeEqual(
    Buffer.from(hashedInputPassword, "hex"),
    Buffer.from(hashedPassword, "hex")
  );
}

export function generateTokenAndExpirationDate() {
  const token = crypto.randomBytes(32).toString("hex").normalize();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { token, expiresAt };
}