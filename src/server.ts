/* eslint-disable no-console */
import { Server } from "http";

import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server;

const startServer = async () => {
  // await mongoose.connect(process.env.MONGO_URI || "", {})
  try {
    console.log(envVars.NODE_ENV);
    await mongoose.connect(envVars.DATABASE_URL);
    console.log("Connected to DB");
    server = app.listen(envVars.PORT, () => {
      console.log(`Server is running port ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  await startServer();
  await seedSuperAdmin();
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
