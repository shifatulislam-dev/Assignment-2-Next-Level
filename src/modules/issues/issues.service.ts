import { pool } from "../../db"

const createIssuesIntoDB = async (payload: { title: string, description: string, type: string, reporter_id: number }) => {
    const { title, description, type, reporter_id } = payload

    const issuesData = await pool.query(`
            INSERT INTO issues(title, description, type, reporter_id) VALUES($1,$2,$3,$4) RETURNING *
        `,[title, description, type, reporter_id]) 
    
    const issue = issuesData.rows[0]
    return issue
}

export const issuesService = {
    createIssuesIntoDB
}