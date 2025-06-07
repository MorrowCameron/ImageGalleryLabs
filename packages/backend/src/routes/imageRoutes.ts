import express, { Request, Response, RequestHandler } from "express";
import { ImageProvider } from "../ImageProvider";
import { ObjectId } from "mongodb";
import { verifyAuthToken, AuthenticatedRequest } from "../middleware/VerifyAuthToken";
import {
  imageMiddlewareFactory,
  handleImageFileErrors,
} from "../middleware/imageUploadMiddleware";

export function waitDuration(numMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, numMs));
}

const MAX_NAME_LENGTH = 100;

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {
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

  const updateImageNameHandler = async (req: AuthenticatedRequest, res: Response) => {
    const { imageId } = req.params;
    const { newName } = req.body;

    if (!newName || typeof newName !== "string") {
      res.status(400).send({
        error: "Bad Request",
        message: "newName must be a string",
      });
      return;
    }

    if (newName.length > MAX_NAME_LENGTH) {
      res.status(422).send({
        error: "Unprocessable Entity",
        message: `Image name exceeds ${MAX_NAME_LENGTH} characters`,
      });
      return;
    }

    if (!ObjectId.isValid(imageId)) {
      console.log("First fail");
      res.status(404).send({
        error: "Not Found",
        message: "Image does not exist",
      });
      return;
    }

    try {
      const authorId = await imageProvider.getImageAuthorId(imageId);

      if (!authorId) {
        console.log("Second fail");
        res.status(404).send({
          error: "Not Found",
          message: "Image does not exist",
        });
        return;
      }

      if (authorId !== req.user?.username) {
        res.status(403).send({
          error: "Forbidden",
          message: "You do not have permission to modify this image",
        });
        return;
      }

      const matchedCount = await imageProvider.updateImageName(imageId, newName);

      if (matchedCount === 0) {
        console.log("Third fail");
        res.status(404).send({
          error: "Not Found",
          message: "Image does not exist",
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  app.put("/api/images/:imageId", express.json(), verifyAuthToken, updateImageNameHandler);

  registerUploadRoute(app, imageProvider);
}

export function registerUploadRoute(app: express.Application, imageProvider: ImageProvider) {
  app.post(
    "/api/images",
    verifyAuthToken,
    imageMiddlewareFactory.single("image"), // matches form <input name="image" />
    handleImageFileErrors,
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.file || !req.body.name) {
        res.status(400).send({
          error: "Bad Request",
          message: "Missing image file or name",
        });
        return;
      }

      const filename = req.file.filename;
      const src = `/uploads/${filename}`;
      const name = req.body.name;
      const author = req.user?.username;

      if (!author) {
        res.status(403).send({ error: "Forbidden", message: "No user token" });
        return;
      }

      try {
        await imageProvider.createImage({ name, src, author });
        res.status(201).end();
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Internal server error" });
      }
    }
  );
}
