/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { Prisma } from '@prisma/client'
import { Request, Response } from 'express'
import { computeSummaryStatisticsReducer } from './computeSummaryStatisticsReducer'
import {
  EmployeesByDepartment,
  EmployeesBySubDepartment,
  SummaryStatisticsByDepartment,
  SummaryStatisticsBySubDepartment
} from './types'
import prisma from './../client'

export const postEmployee = async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { name, salary, currency, on_contract, department, sub_department } =
    req.body
  const user: Prisma.EmployeeCreateInput = {
    name,
    salary,
    currency,
    onContract: Boolean(on_contract) ?? false,
    department,
    subDepartment: sub_department
  }

  const employee = await prisma.employee.create({
    data: user
  })
  res.json(employee)
}

export const deleteEmployee = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await prisma.employee.delete({
      where: { id: Number(id) }
    })
    return res.status(204).send()
  } catch (error) {
    console.error(error)
    res.json({ error: `Something went wrong deleting employee ID ${id}` })
  }
}

export const getEmployeeSalaryStats = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany()
    const stats = employees.reduce(computeSummaryStatisticsReducer, { mean: 0 })

    res.json(stats)
  } catch (error) {
    console.error(error)
    res.json({ error: 'Something went wrong fetching employees' })
  }
}

export const getEmployeeSalaryStatsOnContract = async (
  req: Request,
  res: Response
) => {
  try {
    const employees = await prisma.employee.findMany({
      where: {
        onContract: true
      }
    })
    const stats = employees.reduce(computeSummaryStatisticsReducer, { mean: 0 })

    res.json(stats)
  } catch (error) {
    console.error(error)
    res.json({ error: 'Something went wrong fetching employees' })
  }
}

export const getEmployeeSalaryStatsByDepartment = async (
  req: Request,
  res: Response
) => {
  try {
    const employees = await prisma.employee.findMany()

    // group employees by department
    const employeesByDepartment = employees.reduce<EmployeesByDepartment>(
      (employees, employee) => {
        // check for undefined keys
        employees[employee.department] = (
          employees[employee.department] ?? []
        ).concat(employee)
        return employees
      },
      {}
    )

    // loop over each department computing summary statistics for each set of employees
    const stats: SummaryStatisticsByDepartment = {}
    let k: keyof typeof employeesByDepartment
    for (k in employeesByDepartment) {
      stats[k] = employeesByDepartment[k].reduce(
        computeSummaryStatisticsReducer,
        { mean: 0 }
      )
    }
    res.json(stats)
  } catch (error) {
    console.error(error)
    res.json({ error: 'Something went wrong fetching employees' })
  }
}

export const getEmployeeSalaryStatsBySubDepartment = async (
  req: Request,
  res: Response
) => {
  try {
    const employees = await prisma.employee.findMany()

    // group employees by department and sub-department
    const employeesBySubDepartment = employees.reduce<EmployeesBySubDepartment>(
      (employees, employee) => {
        // set initial value because index signatures return undefined if unset
        if (employees[employee.department] === undefined) {
          employees[employee.department] = {}
        }

        // check for undefined keys
        employees[employee.department][employee.subDepartment] = (
          employees[employee.department][employee.subDepartment] ?? []
        ).concat(employee)
        return employees
      },
      {}
    )

    // loop over each department and sub department computing summary statistics for each set of employees
    const stats: SummaryStatisticsBySubDepartment = {}

    let depKey: keyof typeof employeesBySubDepartment
    for (depKey in employeesBySubDepartment) {
      const department = employeesBySubDepartment[depKey]

      let subKey: keyof typeof department
      for (subKey in department) {
        // set initial value because index signatures return undefined if unset
        if (stats[depKey] === undefined) {
          stats[depKey] = {}
        }
        stats[depKey][subKey] = department[subKey].reduce(
          computeSummaryStatisticsReducer,
          { mean: 0 }
        )
      }
    }
    res.json(stats)
  } catch (error) {
    console.error(error)
    res.json({ error: 'Something went wrong fetching employees' })
  }
}
