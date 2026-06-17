import { pool } from "../../db"

const createIssuesIntoDB = async (payload: { title: string, description: string, type: string }) => {
    const { title, description, type } = payload

    const result = await pool.query(`
            INSERT INTO issues(title, description, type) VALUES($1,$2,$3) RETURNING *
        `,[title, description, type]) 
    return result
}

export const issuesService = {
    createIssuesIntoDB
}