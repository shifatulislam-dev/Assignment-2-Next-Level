import { pool } from "../../db"

const logInUserIntoDB = async(payload : any)=>{
    const {email, password} = payload

    const userData = await pool.query(`
            SELECT * FROM 
        `)
}

export const authService = {
    logInUserIntoDB
}