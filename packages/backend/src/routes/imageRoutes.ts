import express, { Request, Response, RequestHandler } from "express";
import { ImageProvider } from "../ImageProvider";
import { ObjectId } from "mongodb";

export function waitDuration(numMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, numMs));
}

const MAX_NAME_LENGTH = 100;

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {
  // GET all images or search
  const getImagesHandler: RequestHandler = async (req, res) => {
    const searchQuery = String(req.query.name || "").trim();
    console.log("Search query:", searchQuery);

    await waitDuration(1000);

    try {
      const images = await imageProvider.getAllImages(searchQuery || undefined);
      res.json(images);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  app.get("/api/images", getImagesHandler);

  // PUT update image name
  const updateImageNameHandler: RequestHandler = async (req, res) => {
    const { imageId } = req.params;
    const { newName } = req.body;

    if (!newName || typeof newName !== "string") {
      res.status(400).send({
        error: "Bad Request",
        message: "newName must be a string"
      });
      return;
    }

    if (newName.length > MAX_NAME_LENGTH) {
      res.status(422).send({
        error: "Unprocessable Entity",
        message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
      });
      return;
    }

    if (!ObjectId.isValid(imageId)) {
      res.status(404).send({
        error: "Not Found",
        message: "Image does not exist"
      });
      return;
    }

    try {
      const matchedCount = await imageProvider.updateImageName(imageId, newName);

      if (matchedCount === 0) {
        res.status(404).send({
          error: "Not Found",
          message: "Image does not exist"
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  app.put("/api/images/:imageId", express.json(), updateImageNameHandler);
}
