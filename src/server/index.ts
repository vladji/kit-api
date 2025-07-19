import { httpServer } from "../app";
import { connectToDB } from "./db";
import { registerSocketHandlers } from "./socket";
import { PORT } from "../config/constants";

export const server = async () => {
  await connectToDB();
  registerSocketHandlers();

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};
