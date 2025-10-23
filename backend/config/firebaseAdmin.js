import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const serviceAccount = require("./firebase-service-account-key.json");

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin SDK initialized.");
} catch (error) {
  if (!/already exists/u.test(error.message)) {
    console.error("Firebase Admin SDK initialization error:", error.stack);
  }
}

export default admin;
