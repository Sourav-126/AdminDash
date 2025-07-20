import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface JwtRequestPayload {
  id: string;
}

export const middleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization as string;

  try {
    const payload = jwt.verify(
      authHeader,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    // 👇 Use a cast here to temporarily tell TS about userId
    (req as Request & { userId?: string }).userId = (
      payload as JwtRequestPayload
    ).id;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
