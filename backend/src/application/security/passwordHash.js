"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const crypto_1 = require("crypto");
function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString("hex");
    const hash = (0, crypto_1.scryptSync)(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}
function verifyPassword(password, storedPasswordHash) {
    const [salt, hash] = storedPasswordHash.split(":");
    if (!salt || !hash) {
        return false;
    }
    const storedHash = Buffer.from(hash, "hex");
    const incomingHash = (0, crypto_1.scryptSync)(password, salt, 64);
    return storedHash.length === incomingHash.length && (0, crypto_1.timingSafeEqual)(storedHash, incomingHash);
}
