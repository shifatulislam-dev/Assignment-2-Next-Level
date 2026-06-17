import { pool } from "../../db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import config from "../../config"

const logInUserIntoDB = async(payload : {email : string , password : string})=>{
    const {email, password} = payload

    const userData = await pool.query(`
            SELECT * FROM users WHERE email=$1
        `,[email])

    if(userData.rows.length === 0){
        throw new Error("Invalid Credential")
    }

    const user = userData.rows[0]

    const comparePassword = await bcrypt.compare(password, user.password)

    if(!comparePassword){
        throw new Error("Invalid Password")
    }

    const jwtPayload = {
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
    }

    const accessToken = jwt.sign(jwtPayload, config.token_secret as string, {expiresIn : "1d"})

    return {user,accessToken}

}

export const authService = {
    logInUserIntoDB
}