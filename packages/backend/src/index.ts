import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { ValidRoutes } from "./shared/ValidRoutes";
import { fetchDataFromServer } from "./shared/MockAppData";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

const app = express();

function waitDuration(numMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, numMs));
}

app.use(express.static(STATIC_DIR));

app.get("/api/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

app.get(Object.values(ValidRoutes), (req: Request, res: Response) => {
    res.sendFile("index.html", { root: STATIC_DIR });
});

app.get("/api/images/:imageId", (req: Request, res: Response) => {
    waitDuration(1000).then(() => {
        res.json(fetchDataFromServer());
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
