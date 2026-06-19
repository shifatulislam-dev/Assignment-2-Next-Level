

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/users/user.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  port: process.env.PORT,
  db_secret: process.env.DB_SECRET,
  token_secret: process.env.TOKEN_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.db_secret
});
var initDB = async () => {
  try {
    await pool.query(`
                CREATE TABLE IF NOT EXISTS users(
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(20) NOT NULL,
                    email VARCHAR(30) NOT NULL UNIQUE,
                    password TEXT NOT NULL,
                    role VARCHAR(15) DEFAULT 'contributor' CHECK(role IN('maintainer', 'contributor')),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
    await pool.query(`
                CREATE TABLE IF NOT EXISTS issues(
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(150) NOT NULL,
                    description TEXT NOT NULL CHECK(LENGTH(description) >= 20),
                    type VARCHAR(20) NOT NULL CHECK(type IN ('bug', 'feature_request')),
                    status VARCHAR(20) NOT NULL CHECK (status IN('open', 'in_progress', 'resolved')) DEFAULT 'open',
                    reporter_id INT REFERENCES users(id) ON DELETE CASCADE,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
    console.log("BD Connected Successfully. Yahuu!");
  } catch (error) {
    console.log("DB Connection Error:", error);
  }
};

// src/modules/users/user.service.ts
import bcrypt from "bcryptjs";
var userRegIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(`
            INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,COALESCE($4,'contributor')) RETURNING *
        `, [name, email, hashPassword, role]);
  delete result.rows[0].password;
  return result;
};
var userService = {
  userRegIntoDB
};

// src/modules/users/user.controller.ts
var userRegistration = async (req, res) => {
  try {
    const result = await userService.userRegIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User created successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: error
    });
  }
};
var userController = {
  userRegistration
};

// src/modules/users/user.route.ts
var router = Router();
router.post("/", userController.userRegistration);
var userRoute = router;

// src/modules/auth/auth.route.ts
import { Router as Router2 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
import jwt from "jsonwebtoken";
var logInUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(`
            SELECT * FROM users WHERE email=$1
        `, [email]);
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credential");
  }
  const user = userData.rows[0];
  const comparePassword = await bcrypt2.compare(password, user.password);
  if (!comparePassword) {
    throw new Error("Invalid Password");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at
  };
  const accessToken = jwt.sign(jwtPayload, config_default.token_secret, { expiresIn: "1d" });
  return { user, accessToken };
};
var authService = {
  logInUserIntoDB
};

// src/modules/auth/auth.controller.ts
var logInUser = async (req, res) => {
  try {
    const { user, accessToken } = await authService.logInUserIntoDB(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { accessToken, user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var authController = {
  logInUser
};

// src/modules/auth/auth.route.ts
var router2 = Router2();
router2.post("/", authController.logInUser);
var authRouter = router2;

// src/modules/issues/issues.route.ts
import { Router as Router3 } from "express";

// src/modules/issues/issues.service.ts
var createIssuesIntoDB = async (payload, user) => {
  const { title, description, type } = payload;
  const issuesData = await pool.query(`
            INSERT INTO issues(title, description, type, reporter_id) VALUES($1,$2,$3,$4) RETURNING *
        `, [title, description, type, user.id]);
  const issue = issuesData.rows[0];
  return issue;
};
var getAllIssuesFromDB = async () => {
  const result = await pool.query(`
            SELECT * FROM issues
        `);
  return result.rows;
};
var getSingleIssueFromDB = async (id) => {
  const result = await pool.query(`
            SELECT * FROM issues WHERE id=$1
        `, [id]);
  return result.rows[0];
};
var updateIssueFromDB = async (payload, id, user) => {
  const { title, description, type, status } = payload;
  const issueData = await pool.query(`
        SELECT * FROM issues WHERE id=$1
        `, [id]);
  console.log(issueData.rows[0]);
  if (!issueData.rows[0]) {
    throw new Error("There is no issue as your wish.");
  }
  if (user.role === "contributor") {
    if (issueData.rows[0].reporter_id !== user.id) {
      throw new Error("You are unauthorized for update this issue.");
    } else {
      if (issueData.rows[0].status !== "open") {
        throw new Error("This issue is not open right now.");
      }
    }
  }
  const result = await pool.query(`
    UPDATE issues SET title = COALESCE($1, title), description = COALESCE($2, description), type = COALESCE($3, type), status = COALESCE($4, status) WHERE id=$5 RETURNING *
`, [title, description, type, status, id]);
  return result;
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(`
            DELETE FROM issues WHERE id=$1
        `, [id]);
  return result;
};
var issuesService = {
  createIssuesIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueFromDB,
  deleteIssueFromDB
};

// src/modules/issues/issues.controller.ts
var createIssues = async (req, res) => {
  try {
    const user = req.user;
    const result = await issuesService.createIssuesIntoDB(req.body, user);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await issuesService.getAllIssuesFromDB();
    res.status(200).json({
      success: true,
      message: "Issues found successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issuesService.getSingleIssueFromDB(id);
    if (!result) {
      throw new Error("The issue doesn't belong here. It's invalid.");
    }
    res.status(200).json({
      success: true,
      message: "Issues found successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const result = await issuesService.updateIssueFromDB(req.body, id, user);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User Not Found",
        data: {}
      });
    }
    res.status(200).json({
      success: true,
      message: "User updated successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issuesService.deleteIssueFromDB(id);
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var issuesController = {
  createIssues,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...Roles) => {
  return async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const userDecoded = jwt2.verify(token, config_default.token_secret);
    const userData = await pool.query(`
                SELECT * FROM users WHERE email=$1
            `, [userDecoded.email]);
    if (userData.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    const user = userData.rows[0];
    if (Roles.length && !Roles.includes(user.role)) {
      res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    req.user = user;
    next();
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/modules/issues/issues.route.ts
var router3 = Router3();
router3.post("/", auth_default(USER_ROLE.contributor, USER_ROLE.maintainer), issuesController.createIssues);
router3.get("/", issuesController.getAllIssues);
router3.get("/:id", issuesController.getSingleIssue);
router3.patch("/:id", auth_default(USER_ROLE.contributor, USER_ROLE.maintainer), issuesController.updateIssue);
router3.delete("/:id", auth_default(USER_ROLE.maintainer), issuesController.deleteIssue);
var issuesRouter = router3;

// src/middleware/globalError.ts
var globalError = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded());
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use("/api/auth/signup", userRoute);
app.use("/api/auth/login", authRouter);
app.use("/api/issues", issuesRouter);
app.use(globalError);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`App listening on port: ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map