import type { Request, Response } from "express";
import { issuesService } from "./issues.service";

const createIssues = async (req: Request, res: Response) => {
    try {
        const user = req.user
        const result = await (issuesService.createIssuesIntoDB(req.body, user))

        res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: result
        })
    } catch (error: any) {
        res.status(500).json({
            message: error.message,
            data: error
        })
    }
}

const getAllIssues = async (req: Request, res: Response) => {
    try {
        const result = await (issuesService.getAllIssuesFromDB())
        res.status(200).json({
            success: true,
            message: "Issues found successfully",
            data: result
        })

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error
        })
    }
}

const getSingleIssue = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const result = await (issuesService.getSingleIssueFromDB(id as string))

        if (!result) {
            throw new Error("The issue doesn't belong here. It's invalid.")
        }
        res.status(200).json({
            success: true,
            message: "Issues found successfully",
            data: result
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error
        })
    }
}

const updateIssue = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const result = await issuesService.updateIssueFromDB(req.body, id as string)

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "User Not Found",
                data: {}
            })
        }

        res.status(201).json({
            success: true,
            message: "User updated successfully!",
            data: result.rows[0]
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error
        })
    }

}

export const issuesController = {
    createIssues,
    getAllIssues,
    getSingleIssue,
    updateIssue
}