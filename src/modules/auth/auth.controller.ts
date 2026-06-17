import type { Request, Response } from "express";
import { authService } from "./auth.service";

const logInUser = async (req: Request, res: Response) => {
    try {
        const {user, accessToken} = await(authService.logInUserIntoDB(req.body))

        res.status(200).json({
            success : true,
            message: "Login successful",
            data: {accessToken, user}
        })

    } catch (error: any) {
        res.status(500).json({
            message: error.message,
            data: error
        })
    }
}

export const authController = {
    logInUser
}