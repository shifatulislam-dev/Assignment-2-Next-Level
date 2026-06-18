import type { Request, Response } from "express"
import { pool } from "../../db"

const createIssuesIntoDB = async (payload: { title: string, description: string, type: string}, user : any) => {
    const { title, description, type } = payload

    const issuesData = await pool.query(`
            INSERT INTO issues(title, description, type, reporter_id) VALUES($1,$2,$3,$4) RETURNING *
        `,[title, description, type, user.id]) 
    
    const issue = issuesData.rows[0]
    // issuesData.rows[0].reporter_id = user.id 
    return issue
}

const getAllIssuesFromDB = async()=>{
    const result = await pool.query(`
            SELECT * FROM issues
        `)
    return result.rows
}

const getSingleIssueFromDB = async(id : string)=>{
    const result = await pool.query(`
            SELECT * FROM issues WHERE id=$1
        `,[id])
    return result.rows[0]
}

export const issuesService = {
    createIssuesIntoDB,
    getAllIssuesFromDB,
    getSingleIssueFromDB
}