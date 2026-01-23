"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const auth_service_1 = require("./auth.service");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const setCookie_1 = require("../../utils/setCookie");
const env_1 = require("../../config/env");
const userTokens_1 = require("../../utils/userTokens");
const passport_1 = __importDefault(require("passport"));
const invite_model_1 = require("../invite/invite.model");
const user_model_1 = require("../user/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto = __importStar(require("crypto"));
const credentialsLogin = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    passport_1.default.authenticate("local", async (err, user, info) => {
        if (err) {
            return next(new AppError_1.default(401, err));
        }
        if (!user) {
            return next(new AppError_1.default(401, info.message));
        }
        const userTokens = await (0, userTokens_1.createUserTokens)(user);
        const { password: pass, ...rest } = user.toObject();
        (0, setCookie_1.setAuthCookie)(res, userTokens);
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.default.OK,
            message: "User Logged In Successfully",
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user: rest,
            },
        });
    })(req, res, next);
});
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
const inviteUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { email, role } = req.body;
    // Generate a random token for the invite
    const token = crypto.randomBytes(32).toString("hex");
    const invite = await invite_model_1.Invite.create({
        email,
        role,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
    console.log(`Invite Link: ${env_1.envVars.FRONT_END_URL}/register?token=${token}`);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: "Invitation sent successfully",
        data: {
            inviteToken: token,
        },
    });
});
const registerViaInvite = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { inviteToken, password, name } = req.body;
    if (!inviteToken) {
        throw new AppError_1.default(400, "Invite token is required");
    }
    const invite = await invite_model_1.Invite.findOne({
        token: inviteToken.trim(),
        isUsed: false,
    });
    console.log("TOKEN FROM BODY:", inviteToken);
    console.log("INVITE FOUND:", invite);
    if (!invite) {
        throw new AppError_1.default(400, "Invalid or expired invite");
    }
    if (invite.expiresAt < new Date()) {
        throw new AppError_1.default(400, "Invite expired");
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    const user = await user_model_1.User.create({
        email: invite.email,
        password: hashedPassword,
        role: invite.role,
        name,
    });
    invite.isUsed = true;
    invite.acceptedAt = new Date();
    await invite.save();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 201,
        message: "User registered successfully",
        data: user,
    });
});
const getNewAccessToken = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "refresh token no received from cookies");
    }
    const tokenInfo = await auth_service_1.AuthServices.getNewAccessToken(refreshToken);
    (0, setCookie_1.setAuthCookie)(res, tokenInfo);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: " New Access Token Retrieved successfully",
        data: tokenInfo,
    });
});
const logOut = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
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
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User Logged out Successfully",
        data: null,
    });
});
const resetPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user;
    await auth_service_1.AuthServices.resetPassword(oldPassword, newPassword, decodedToken);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Password Change Successfully",
        data: null,
    });
});
const googleCallbackController = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    let redirectTo = req.query.state ? req.query.state : "";
    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1);
    }
    // /booking => booking , => "/" => ""
    const user = req.user;
    console.log("user", user);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User Not Found");
    }
    const tokenInfo = (0, userTokens_1.createUserTokens)(user);
    (0, setCookie_1.setAuthCookie)(res, tokenInfo);
    res.redirect(`${env_1.envVars.FRONT_END_URL}/${redirectTo}`);
});
exports.AuthController = {
    credentialsLogin,
    inviteUser,
    getNewAccessToken,
    logOut,
    resetPassword,
    googleCallbackController,
    registerViaInvite,
};
