export const PORT = 3001;
export const URL_ORIGIN = process.env.URL_ORIGIN || "http://localhost:5173";
const DEV_URL = `http://192.168.1.36:${PORT}`;
export const ORIGIN = [URL_ORIGIN, "http://localhost:5173", "http://localhost:5174", `http://localhost:${PORT}`, DEV_URL];
