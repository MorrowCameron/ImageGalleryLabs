import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { ValidRoutes } from "./shared/ValidRoutes";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";
import { waitDuration, registerImageRoutes } from "./routes/imageRoutes";
import { register } from "module";
dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.

const mongoClient = connectMongo();
const imageProvider = new ImageProvider(mongoClient);

const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

const app = express();

registerImageRoutes(app, imageProvider);

app.use(express.static(STATIC_DIR));

app.get("/api/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

app.get(Object.values(ValidRoutes), (req: Request, res: Response) => {
    res.sendFile("index.html", { root: STATIC_DIR });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
