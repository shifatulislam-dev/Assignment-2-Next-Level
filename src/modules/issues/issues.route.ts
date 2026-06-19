import { Router } from "express";
import { issuesController } from "./issues.controller";
import auth from "../../middleware/auth";
import { USER_ROLE, type ROLE_TYPE } from "../../types";

const router = Router()

router.post("/", auth(USER_ROLE.contributor as ROLE_TYPE, USER_ROLE.maintainer as ROLE_TYPE), issuesController.createIssues)
router.get("/", issuesController.getAllIssues)
router.get("/:id", issuesController.getSingleIssue)
router.patch("/:id", auth(USER_ROLE.contributor as ROLE_TYPE, USER_ROLE.maintainer as ROLE_TYPE), issuesController.updateIssue)

export const issuesRouter = router