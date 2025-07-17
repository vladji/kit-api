import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://vladji:hdOpL9$88**813@kit-1.ervirlm.mongodb.net/main?retryWrites=true&w=majority&appName=kit-1";

export const connectToDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: process.env.NODE_ENV === "development",
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};
