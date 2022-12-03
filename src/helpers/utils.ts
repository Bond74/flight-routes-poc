import * as crypto from "crypto";

export const getHashedValue = (value: string): string =>
  crypto
    .createHash("sha1")
    .update(value.toLowerCase())
    .digest("base64");

