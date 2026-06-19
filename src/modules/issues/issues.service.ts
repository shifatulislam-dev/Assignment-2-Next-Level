import type { Request, Response } from "express"
import { pool } from "../../db"
import type { IIssues } from "./issues.interface"

const createIssuesIntoDB = async (payload: IIssues, user: any) => {
    const { title, description, type } = payload

    const issuesData = await pool.query(`
            INSERT INTO issues(title, description, type, reporter_id) VALUES($1,$2,$3,$4) RETURNING *
        `, [title, description, type, user.id])

    const issue = issuesData.rows[0]
    // issuesData.rows[0].reporter_id = user.id 
    return issue
}

const getAllIssuesFromDB = async () => {
    const result = await pool.query(`
            SELECT * FROM issues
        `)
    return result.rows
}

const getSingleIssueFromDB = async (id: string) => {
    const result = await pool.query(`
            SELECT * FROM issues WHERE id=$1
        `, [id])
    return result.rows[0]
}

const updateIssueFromDB = async (payload: IIssues, id: string, user: any) => {
    const { title, description, type, status } = payload
    const issueData = await pool.query(`
        SELECT * FROM issues WHERE id=$1
        `, [id])
    console.log(issueData.rows[0]);

    if (!issueData.rows[0]) {
        throw new Error("There is no issue as your wish.")
    }
    if (user.role === "contributor") {

        if (issueData.rows[0].reporter_id !== user.id) {
            throw new Error("You are unauthorized for update this issue.")
        } else {
            if (issueData.rows[0].status !== "open") {
                throw new Error("This issue is not open right now.")
            }
        }
        // console.log(user);    
    }
    const result = await pool.query(`
    UPDATE issues SET title = COALESCE($1, title), description = COALESCE($2, description), type = COALESCE($3, type), status = COALESCE($4, status) WHERE id=$5 RETURNING *
`, [title, description, type, status, id])
    return result
}

const deleteIssueFromDB = async(id : string)=>{
    const result = await pool.query(`
            DELETE FROM issues WHERE id=$1
        `,[id])
    return result
}

export const issuesService = {
    createIssuesIntoDB,
    getAllIssuesFromDB,
    getSingleIssueFromDB,
    updateIssueFromDB,
    deleteIssueFromDB
}