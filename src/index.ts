import {Prisma, PrismaClient} from '@prisma/client'
import express, {NextFunction, Request, Response} from 'express'
import {computeSummaryStatisticsReducer} from "./util/computeSummaryStatisticsReducer";
import {
  EmployeesByDepartment,
  EmployeesBySubDepartment,
  SummaryStatisticsByDepartment,
  SummaryStatisticsBySubDepartment
} from "./util/types";
import {AnyZodObject} from "zod";
import {employeeCreateRequest} from "./validation/requests";
import jwt from 'jsonwebtoken'
import {expressjwt} from 'express-jwt'

const prisma = new PrismaClient()
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
  async (req, res) => {
  const { name, salary, currency, on_contract, department, sub_department } = req.body
  const user: Prisma.EmployeeCreateInput = {
    name,
    salary,
    currency,
    onContract: !!on_contract ?? false,
    department,
    subDepartment: sub_department,
  }

  const employee = await prisma.employee.create({
    data: user
  })
  res.json(employee)
})

app.delete('/employee/:id', async (req, res) => {
  const { id } = req.params

  try {
    await prisma.employee.delete({
      where: {id: Number(id)}
    })
    res.status(204)
  } catch (error) {
    console.error(error)
    res.json({ error: `Something went wrong deleting employee ID ${id}` })
  }
})

app.get('/employee/salary-stats', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany()
    const stats = employees.reduce(computeSummaryStatisticsReducer, {mean: 0})

    res.json(stats)
  } catch (error) {
    console.error(error)
    res.json({ error: `Something went wrong fetching employees` })
  }
})

app.get('/employee/salary-stats/on-contract', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      where: {
        onContract: true,
      }
    })
    const stats = employees.reduce(computeSummaryStatisticsReducer, {mean: 0})

    res.json(stats)
  } catch (error) {
    console.error(error)
    res.json({ error: `Something went wrong fetching employees` })
  }
})

app.get('/employee/salary-stats/by-department', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany()

    // group employees by department
    const employeesByDepartment = employees.reduce<EmployeesByDepartment>((employees, employee) => {
      // check for undefined keys
      employees[employee.department] = (employees[employee.department] ?? []).concat(employee)
      return employees
    }, {})

    // loop over each department computing summary statistics for each set of employees
    const stats: SummaryStatisticsByDepartment = {}
    let k: keyof typeof employeesByDepartment
    for (k in employeesByDepartment) {
      stats[k] = employeesByDepartment[k].reduce(computeSummaryStatisticsReducer, {mean: 0})
    }
    res.json(stats)
  } catch (error) {
    console.error(error)
    res.json({ error: `Something went wrong fetching employees` })
  }
})

app.get('/employee/salary-stats/by-sub-department', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany()

    // group employees by department and sub-department
    const employeesBySubDepartment = employees.reduce<EmployeesBySubDepartment>((employees, employee) => {
      // check for undefined keys
      employees[employee.department][employee.subDepartment] = (employees[employee.department][employee.subDepartment] ?? []).concat(employee)
      return employees
    }, {})

    // loop over each department and sub department computing summary statistics for each set of employees
    const stats: SummaryStatisticsBySubDepartment = {}

    let depKey: keyof typeof employeesBySubDepartment
    for (depKey in employeesBySubDepartment) {
      const department = employeesBySubDepartment[depKey]

      let subKey: keyof typeof department
      for (subKey in department) {
        stats[depKey][subKey] = department[subKey].reduce(computeSummaryStatisticsReducer, {mean: 0})
      }
    }
    res.json(stats)
  } catch (error) {
    console.error(error)
    res.json({ error: `Something went wrong fetching employees` })
  }
})

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`),
)
