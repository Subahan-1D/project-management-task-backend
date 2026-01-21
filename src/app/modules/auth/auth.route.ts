import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from "./auth.controller";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import passport from "passport";
import { envVars } from "../../config/env";

const router = Router();

router.post("/login", AuthController.credentialsLogin);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post("/logout", AuthController.logOut);
router.post(
  "/reset-password",
  checkAuth(...Object.values(Role)),
  AuthController.resetPassword
);

router.get(
  "/google",
  async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || "/";
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: redirect as string,
    })(req, res, next);
  }
);

// api/v1/auth/google/callback?state=/booking
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${envVars.FRONT_END_URL}/login?error=There is some issues with your account. Please contact with out support team!`,
  }),
  AuthController.googleCallbackController
);

export const AuthRoutes = router;
