import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";

class ImageFormatError extends Error {}

const storageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = process.env.IMAGE_UPLOAD_DIR || "uploads";
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        let ext = "";
        if (file.mimetype === "image/png") ext = "png";
        else if (["image/jpeg", "image/jpg"].includes(file.mimetype)) ext = "jpg";
        else return cb(new ImageFormatError("Unsupported image type"), "");

        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
        cb(null, filename);
    }
});

export const imageMiddlewareFactory = multer({
    storage: storageEngine,
    limits: { files: 1, fileSize: 5 * 1024 * 1024 }
});

export function handleImageFileErrors(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError || err instanceof ImageFormatError) {
        res.status(400).send({ error: "Bad Request", message: err.message });
        return;
    }
    next(err);
}
