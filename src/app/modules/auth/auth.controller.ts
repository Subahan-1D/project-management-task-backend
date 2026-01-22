/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";
import { envVars } from "../../config/env";
import { createUserTokens } from "../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import passport from "passport";
import { Invite } from "../invite/invite.model";
import { generateToken, verifyToken } from "../../utils/jwt";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";
import * as crypto from "crypto";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        return next(new AppError(401, err));
      }

      if (!user) {
        return next(new AppError(401, info.message));
      }

      const userTokens = await createUserTokens(user);

      const { password: pass, ...rest } = user.toObject();

      setAuthCookie(res, userTokens);

      sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged In Successfully",
        data: {
          accessToken: userTokens.accessToken,
          refreshToken: userTokens.refreshToken,
          user: rest,
        },
      });
    })(req, res, next);
  },
);

// const inviteUser = catchAsync(async (req, res) => {
//   const { email, role } = req.body;

//   const token = req.headers.authorization as string;

//   await Invite.create({
//     email,
//     role,
//     token,
//     expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
//   });

//   sendResponse(res, {
//     success: true,
//     statusCode: 200,
//     message: "Invitation sent successfully",
//     data: {
//       inviteToken: token,
//     },
//   });
// });

const inviteUser = catchAsync(async (req, res) => {
  const { email, role } = req.body;

  // Generate a random token for the invite
  const token = crypto.randomBytes(32).toString("hex");

  const invite = await Invite.create({
    email,
    role,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  console.log(`Invite Link: ${envVars.FRONT_END_URL}/register?token=${token}`);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Invitation sent successfully",
    data: {
      inviteToken: token,
    },
  });
});

const registerViaInvite = catchAsync(async (req, res) => {
  const { inviteToken, password, name } = req.body;

  if (!inviteToken) {
    throw new AppError(400, "Invite token is required");
  }

  const invite = await Invite.findOne({
    token: inviteToken.trim(),
    isUsed: false,
  });

  console.log("TOKEN FROM BODY:", inviteToken);
  console.log("INVITE FOUND:", invite);

  if (!invite) {
    throw new AppError(400, "Invalid or expired invite");
  }

  if (invite.expiresAt < new Date()) {
    throw new AppError(400, "Invite expired");
  }

  const hashedPassword = await bcryptjs.hash(
    password,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  const user = await User.create({
    email: invite.email,
    password: hashedPassword,
    role: invite.role,
    name,
  });

  invite.isUsed = true;
  invite.acceptedAt = new Date();
  await invite.save();

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "User registered successfully",
    data: user,
  });
});

const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies?.refreshToken as string;
    if (!refreshToken) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "refresh token no received from cookies",
      );
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken);

    setAuthCookie(res, tokenInfo);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: " New Access Token Retrieved successfully",
      data: tokenInfo,
    });
  },
);
const logOut = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Logged out Successfully",
      data: null,
    });
  },
);
const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user;

    await AuthServices.resetPassword(
      oldPassword,
      newPassword,
      decodedToken as JwtPayload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Password Change Successfully",
      data: null,
    });
  },
);

const googleCallbackController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let redirectTo = req.query.state ? (req.query.state as string) : "";

    if (redirectTo.startsWith("/")) {
      redirectTo = redirectTo.slice(1);
    }

    // /booking => booking , => "/" => ""
    const user = req.user;
    console.log("user", user);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
    }

    const tokenInfo = createUserTokens(user);

    setAuthCookie(res, tokenInfo);

    res.redirect(`${envVars.FRONT_END_URL}/${redirectTo}`);
  },
);

export const AuthController = {
  credentialsLogin,
  inviteUser,
  getNewAccessToken,
  logOut,
  resetPassword,
  googleCallbackController,
  registerViaInvite,
};
