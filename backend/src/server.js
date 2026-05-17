"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const MongoDatabase_1 = require("./infrastructure/database/MongoDatabase");
async function startServer() {
    await MongoDatabase_1.mongoDatabase.connect();
    app_1.default.listen(env_1.env.port, () => {
        console.log(`API server running on http://localhost:${env_1.env.port}`);
    });
}
startServer().catch((error) => {
    console.error("Unable to start API server.", error);
    process.exit(1);
});
