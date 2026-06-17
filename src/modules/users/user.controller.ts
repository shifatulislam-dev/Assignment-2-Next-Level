import type { Request, Response } from "express"
import { userService } from "./user.service"

const userRegistration = async(req : Request, res: Response)=>{
    try {
        const result = await (userService.userRegIntoDB(req.body))
        res.status(201).json({
            success: true,
            message: "User created successfully!",
            data: result.rows[0]
        })
    } catch (error : any) {
        res.status(500).json({
            message: error.message,
            data: error
        })
    }
}

export const userController = {
    userRegistration,
}