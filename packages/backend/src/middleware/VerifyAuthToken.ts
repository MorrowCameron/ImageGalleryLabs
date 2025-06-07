import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: { username: string };
}

export const verifyAuthToken: RequestHandler = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).send({
      error: "Unauthorized",
      message: "Missing or malformed token",
    });
    return;
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const jwtSecret = req.app.locals.JWT_SECRET;

  try {
    const payload = jwt.verify(token, jwtSecret) as { username: string };
    (req as AuthenticatedRequest).user = { username: payload.username };
    next();
  } catch (err) {
    res.status(403).send({
      error: "Forbidden",
      message: "Invalid or expired token",
    });
  }
};
