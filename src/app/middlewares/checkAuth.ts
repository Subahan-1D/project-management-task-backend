import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status-codes";
import { User } from "../modules/user/user.model";
import { IsActive } from "../modules/user/user.interface";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization;
      if (!accessToken) {
        throw new AppError(403, "No Token Received");
      }
      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;


      if (authRoles.length && !authRoles.includes(verifiedToken.role)) {
        throw new AppError(403, "You are not permitted to view this route");
      }

      const isUserExists = await User.findOne({
        email: verifiedToken.email,
      });

      if (!isUserExists) {
        throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
      }


      if (isUserExists.isDeleted) {
        throw new AppError(httpStatus.FORBIDDEN, "User is deleted");
      }

      if (isUserExists.isActive === IsActive.INACTIVE) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          `User is blocked or inactive!`
        );
      }

      req.user = verifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };