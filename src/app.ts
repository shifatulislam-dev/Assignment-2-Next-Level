import express, { type Application, type Request, type Response } from "express"
import { userRoute } from "./modules/users/user.route"
import { authRouter } from "./modules/auth/auth.route"
import { issuesRouter } from "./modules/issues/issues.route"
import { globalError } from "./middleware/globalError"

const app : Application = express()

app.use(express.json())
app.use(express.text())
app.use(express.urlencoded())

app.get("/", (req: Request, res : Response)=>{
    res.send("Hello World")
})

app.use("/api/auth/signup", userRoute)
app.use("/api/auth/login", authRouter)
app.use("/api/issues", issuesRouter)

app.use(globalError)


export default app