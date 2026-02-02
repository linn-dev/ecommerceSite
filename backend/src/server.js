import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import { errorHandler } from "./middleware/errorHandler.js"

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// Test route
app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "Server running" });
});

// Routes will go here


app.use(errorHandler);

const PORT = process.env.PORT|| 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})