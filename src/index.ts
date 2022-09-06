import express, {NextFunction, Request, Response} from 'express'
import {AnyZodObject} from "zod";
import {employeeCreateRequest} from "./validation/requests";
import jwt from 'jsonwebtoken'
import {expressjwt} from 'express-jwt'
import {
  deleteEmployee,
  getEmployeeSalaryStats,
  getEmployeeSalaryStatsByDepartment,
  getEmployeeSalaryStatsBySubDepartment,
  getEmployeeSalaryStatsOnContract,
  postEmployee
} from "./employee/handlers";

const app = express()
const tokenSecret = 'SUPER_SECURE_SECRET' // todo pull this from an env variable that comes from a secrets manager

app.use(
  express.json(),
  expressjwt({
    secret: tokenSecret,
    algorithms: ["HS256"],
  }).unless({ path: ["/token"] }),
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.name === "UnauthorizedError") {
      res.status(401).send({code: "INVALID_TOKEN", message: "Token is invalid"});
    } else {
      next(err);
    }
  }
)


const validate = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return res.status(400).json(error);
    }
  };

app.post('/token', (req, res) => {
  const {username, password} = req.body

  if (username !== 'dummy' && password !== 'password') {
    return res.status(401).json({code: "UNAUTHORIZED", message: "Username and/or password are invalid"});
  }

  const token = jwt.sign({username}, tokenSecret, { expiresIn: '7d' });
  return res.json({token});
});

app.post('/employee',
  validate(employeeCreateRequest),
  postEmployee,
)

app.delete('/employee/:id', deleteEmployee)

app.get('/employee/salary-stats', getEmployeeSalaryStats)

app.get('/employee/salary-stats/on-contract', getEmployeeSalaryStatsOnContract)

app.get('/employee/salary-stats/by-department', getEmployeeSalaryStatsByDepartment)

app.get('/employee/salary-stats/by-sub-department', getEmployeeSalaryStatsBySubDepartment)

const server = app.listen(3000, () =>
  console.log(`🚀 Server ready at: http://localhost:3000`),
)
