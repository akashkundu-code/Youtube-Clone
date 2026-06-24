import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// In a serverless environment each request may run in a fresh invocation, so
// we cache the connection on the global object and reuse it across invocations
// instead of opening a new connection every time (which would exhaust Atlas).
let cached = global.__mongooseConn;
if (!cached) {
  cached = global.__mongooseConn = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
