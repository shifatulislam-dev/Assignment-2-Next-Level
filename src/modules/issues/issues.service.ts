import type { Request, Response } from "express"
import { pool } from "../../db"

const createIssuesIntoDB = async (payload: { title: string, description: string, type: string}, user : any) => {
    const { title, description, type } = payload

    const issuesData = await pool.query(`
            INSERT INTO issues(title, description, type, reported_id) VALUES($1,$2,$3,$4) RETURNING *
        `,[title, description, type, user.id]) 
    
    const issue = issuesData.rows[0]
    // issuesData.rows[0].reported_id = user.id 
    return issue
}

const getAllIssuesFromDB = async()=>{
    const result = await pool.query(`
            SELECT * FROM issues
        `)
    return result
}

export const issuesService = {
    createIssuesIntoDB,
    getAllIssuesFromDB
}