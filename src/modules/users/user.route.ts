import { Router } from "express";
import { userController } from "./user.controller";

const router = Router()

router.post("/", userController.userRegistration)

export const userRoute = router