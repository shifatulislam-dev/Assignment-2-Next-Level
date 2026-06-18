import type { NextFunction, Request, Response } from "express";
import type { ROLE_TYPE } from "../types";
import jwt, { type JwtPayload } from "jsonwebtoken"
import config from "../config";
import { pool } from "../db";

const auth = (...Roles: ROLE_TYPE[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization
        
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            })

        }

        const userDecoded = jwt.verify(token as string, config.token_secret as string) as JwtPayload
        const userData = await pool.query(`
                SELECT * FROM users WHERE email=$1
            `, [userDecoded.email])
        if (userData.rows.length === 0) {
            res.status(401).json({
                success: false,
                message: "Invalid token"
            })
        }
        const user = userData.rows[0]

        if (Roles.length && !Roles.includes(user.role)) {
            res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        req.user = user
        // console.log(req.user);
        

        next()
    }
}
export default auth