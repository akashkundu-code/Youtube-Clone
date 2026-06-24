// Vercel serverless entry point for the backend.
//
// On Vercel we don't run `app.listen()` (that's only for local `npm start`).
// Instead Vercel calls this default-exported handler for every request.
// We ensure the database is connected (cached across invocations), then hand
// the request to the Express app.
import { app } from "../src/app.js";
import { connectToDatabase } from "../src/db/serverless.js";

export default async function handler(req, res) {
  try {
    await connectToDatabase();
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({ success: false, message: "Database connection failed" })
    );
  }
  return app(req, res);
}
