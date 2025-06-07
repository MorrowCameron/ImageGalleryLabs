import { Express, Request, Response } from "express";
import { CredentialsProvider } from "../CredentialsProvider";
import jwt from "jsonwebtoken";

interface AuthRequestBody {
  username: string;
  password: string;
}

interface IAuthTokenPayload {
  username: string;
}

function generateAuthToken(username: string, jwtSecret: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const payload: IAuthTokenPayload = { username };
    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: "1d" },
      (error, token) => {
        if (error) reject(error);
        else resolve(token as string);
      }
    );
  });
}

export function registerAuthRoutes(app: Express, credentialsProvider: CredentialsProvider) {
  // /auth/register (modified)
  app.post(
    "/auth/register",
    async (req: Request<{}, {}, AuthRequestBody>, res: Response): Promise<void> => {
      const { username, password } = req.body;

      if (typeof username !== "string" || typeof password !== "string") {
        res.status(400).send({
          error: "Bad request",
          message: "Missing username or password",
        });
        return;
      }

      try {
        const registered = await credentialsProvider.registerUser(username, password);
        if (!registered) {
          res.status(409).send({
            error: "Username already taken",
            message: "Please choose a different username",
          });
          return;
        }

        const jwtSecret: string = req.app.locals.JWT_SECRET;
        const token = await generateAuthToken(username, jwtSecret);
        res.status(201).json({ token });
      } catch (err) {
        console.error("Registration failed:", err);
        res.status(500).send({
          error: "Internal server error",
          message: "Something went wrong",
        });
      }
    }
  );

  // /auth/login with JWT
  app.post(
    "/auth/login",
    async (req: Request<{}, {}, AuthRequestBody>, res: Response): Promise<void> => {
      const { username, password } = req.body;

      if (typeof username !== "string" || typeof password !== "string") {
        res.status(400).send({
          error: "Bad request",
          message: "Missing username or password",
        });
        return;
      }

      try {
        const valid = await credentialsProvider.verifyPassword(username, password);
        if (!valid) {
          res.status(401).send({
            error: "Unauthorized",
            message: "Incorrect username or password",
          });
          return;
        }

        const jwtSecret: string = req.app.locals.JWT_SECRET;
        const token = await generateAuthToken(username, jwtSecret);

        res.status(200).json({ token });
      } catch (err) {
        console.error("Login failed:", err);
        res.status(500).send({
          error: "Internal server error",
          message: "Something went wrong",
        });
      }
    }
  );
}
