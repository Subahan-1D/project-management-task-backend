"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./app/config/env");
const seedSuperAdmin_1 = require("./app/utils/seedSuperAdmin");
let server;
const startServer = async () => {
    // await mongoose.connect(process.env.MONGO_URI || "", {})
    try {
        console.log(env_1.envVars.NODE_ENV);
        await mongoose_1.default.connect(env_1.envVars.DATABASE_URL);
        console.log("Connected to DB");
        server = app_1.default.listen(env_1.envVars.PORT, () => {
            console.log(`Server is running port ${env_1.envVars.PORT}`);
        });
    }
    catch (error) {
        console.log(error);
    }
};
(async () => {
    await startServer();
    await (0, seedSuperAdmin_1.seedSuperAdmin)();
})();
process.on("unhandledRejection", (err) => {
    console.log("unhandled Rejection detected... Server shuting down..", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on("uncaughtException", (err) => {
    console.log("uncaught exception detected... Server shuting down..", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on("SIGTERM", () => {
    console.log("SIGTERM Signal Received... Server shuting down..");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on("SIGINT", () => {
    console.log("SIGINT Signal Received... Server shuting down..");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
// unhandled rejection error
// Promise.reject(new Error("I forgot catch this promise"));
// uncaught rejection error
// throw new Error("I forgot to handle this local error");
// signal termination sigterm
/**
 * unhandled rejection error
 * uncaught rejection error
 * signal termination sigterm
 * */
