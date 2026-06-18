import type { Request, Response } from "express";
import { issuesService } from "./issues.service";

const createIssues = async(req : Request, res : Response)=>{
    const user = req.user
    const result = await(issuesService.createIssuesIntoDB(req.body,user))

    res.status(201).json({
        success: true,
        message: "Issue created successfully",
        data: result
    })
}

export const issuesController = {
    createIssues,
}