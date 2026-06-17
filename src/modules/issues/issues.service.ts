import { pool } from "../../db"

const createIssuesIntoDB = async (payload: { title: string, description: string, type: string }) => {
    const { title, description, type } = payload

    const issuesData = await pool.query(`
            INSERT INTO issues(title, description, type) VALUES($1,$2,$3) RETURNING *
        `,[title, description, type]) 
    
    const issue = issuesData.rows[0]
    return issue
}

export const issuesService = {
    createIssuesIntoDB
}