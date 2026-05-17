"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const nodeEnv = process.env.NODE_ENV ?? "development";
const port = Number(process.env.PORT ?? 4000);
const defaultCorsOrigins = ["http://localhost:5173", "http://localhost:5174"];
const mongoUri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const mongoDatabaseName = process.env.MONGODB_DATABASE ?? "sankalana_dance_academy";
const parseCorsOrigins = (value) => {
    const configuredOrigins = (value ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
    if (configuredOrigins.length === 0) {
        return defaultCorsOrigins;
    }
    if (nodeEnv === "development") {
        return Array.from(new Set([...configuredOrigins, ...defaultCorsOrigins]));
    }
    return configuredOrigins;
};
exports.env = {
    nodeEnv,
    port: Number.isNaN(port) ? 4000 : port,
    corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN),
    mongoUri,
    mongoDatabaseName,
};
