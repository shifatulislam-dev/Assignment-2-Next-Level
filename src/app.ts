import express, { type Application, type Request, type Response } from "express"
import { userRoute } from "./modules/users/user.route"

const app : Application = express()

app.use(express.json())
app.use(express.text())
app.use(express.urlencoded())

app.get("/", (req: Request, res : Response)=>{
    res.send("Hello World")
})

app.use("/api/auth", userRoute)

export default app