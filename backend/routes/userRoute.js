import express from 'express';
import { loginUser,registerUser, startTwoFactorSetup, verifyEnableTwoFactor, verifyTwoFactorLogin, getTwoFactorStatus, disableTwoFactor } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
const userRouter = express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);
userRouter.post("/2fa/start",authMiddleware,startTwoFactorSetup);
userRouter.post("/2fa/enable",authMiddleware,verifyEnableTwoFactor);
userRouter.post("/2fa/verify",verifyTwoFactorLogin);
userRouter.get("/2fa/status",authMiddleware,getTwoFactorStatus);
userRouter.post("/2fa/disable",authMiddleware,disableTwoFactor);

export default userRouter;