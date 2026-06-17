import type { Request, Response } from "express";

const logInUser = async (req: Request, res: Response) => {
    try {

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