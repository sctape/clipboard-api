import {Employee, PrismaClient} from "@prisma/client";
import {DeepMockProxy, mockDeep, mockReset} from "jest-mock-extended";
import prisma from './../../client'

import {
  deleteEmployee,
  getEmployeeSalaryStats,
  getEmployeeSalaryStatsByDepartment,
  getEmployeeSalaryStatsBySubDepartment,
  getEmployeeSalaryStatsOnContract,
  postEmployee
} from "./../handlers";
import {Request, Response} from "express";
import {getMockReq, getMockRes} from "@jest-mock/express";

jest.mock('./../../client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

const { res, next, clearMockRes } = getMockRes()

beforeEach(() => {
  mockReset(prismaMock)
  clearMockRes()
})

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

const employeeData: Employee[] = [
  {
    "id": 1,
    "name": "Abhishek",
    "salary": "145000",
    "currency": "USD",
    "department": "Engineering",
    "onContract": false,
    "subDepartment": "Platform"
  },
  {
    "id": 2,
    "name": "Anurag",
    "salary": "90000",
    "currency": "USD",
    "department": "Banking",
    "onContract": true,
    "subDepartment": "Loan"
  },
  {
    "id": 3,
    "name": "Himani",
    "salary": "240000",
    "currency": "USD",
    "department": "Engineering",
    "onContract": false,
    "subDepartment": "Platform"
  },
  {
    "id": 4,
    "name": "Yatendra",
    "salary": "30",
    "currency": "USD",
    "department": "Operations",
    "onContract": false,
    "subDepartment": "CustomerOnboarding"
  },
  {
    "id": 5,
    "name": "Ragini",
    "salary": "30",
    "currency": "USD",
    "department": "Engineering",
    "onContract": false,
    "subDepartment": "Platform"
  },
  {
    "id": 6,
    "name": "Nikhil",
    "salary": "110000",
    "currency": "USD",
    "onContract": true,
    "department": "Engineering",
    "subDepartment": "Platform"
  },
  {
    "id": 7,
    "name": "Guljit",
    "salary": "30",
    "currency": "USD",
    "department": "Administration",
    "onContract": false,
    "subDepartment": "Agriculture"
  },
  {
    "id": 8,
    "name": "Himanshu",
    "salary": "70000",
    "currency": "EUR",
    "department": "Operations",
    "onContract": false,
    "subDepartment": "CustomerOnboarding"
  },
  {
    "id": 9,
    "name": "Anupam",
    "salary": "200000000",
    "currency": "INR",
    "department": "Engineering",
    "onContract": false,
    "subDepartment": "Platform"
  }
]

describe("Request Handlers", () => {
  describe("PostEmployee", () => {
    it('will create a new employee record', async () => {
      const req: Partial<Request> = {
        body: {
          name: "John Doe",
          salary: "100000",
          currency: "USD",
          on_contract: "true",
          department: "Engineering",
          sub_department: "Something",
        },
      }
      const res: Partial<Response> = {
        json: jest.fn()
      }

      await postEmployee(req as Request, res as Response)
      expect(prisma.employee.create).toBeCalledWith({
        data: {
          name: "John Doe",
          salary: "100000",
          currency: "USD",
          onContract: true,
          department: "Engineering",
          subDepartment: "Something",
        }
      })
      expect(res.json).toBeCalled()
    });


  });

  describe("DeleteEmployee", () => {
    it('will delete an employee', async () => {
      prismaMock.employee.findMany.mockResolvedValue(employeeData)
      const req = getMockReq({
        params: { id: "111" },
        body: { firstname: 'James', lastname: 'Smith', age: 34 },
      })

      await deleteEmployee(req as Request, res as Response)
      expect(res.status).toBeCalledWith(204)
      expect(prisma.employee.delete).toBeCalledWith({
        where: {id: 111}
      })
    });
  });

  describe("GetEmployeeSalaryStats", () => {
    it('will compute salary stats', async () => {
      prismaMock.employee.findMany.mockResolvedValue(employeeData)
      const req: Partial<Request> = {}
      const res: Partial<Response> = {
        json: jest.fn(),
      }

      await getEmployeeSalaryStats(req as Request, res as Response)
      expect(res.json).toBeCalledWith({
        mean: 22295010,
        min: 30,
        max: 200000000,
      })
    });
  });

  describe("GetEmployeeSalaryStatsOnContract", () => {
    it('will compute salary stats on contract', async () => {
      const contractEmployees = employeeData.filter(employee => employee.onContract)

      prismaMock.employee.findMany.mockResolvedValue(contractEmployees)
      const req: Partial<Request> = {}
      const res: Partial<Response> = {
        json: jest.fn(),
      }

      await getEmployeeSalaryStatsOnContract(req as Request, res as Response)
      expect(res.json).toBeCalledWith({
        mean: 100000,
        min: 90000,
        max: 110000,
      })
    });
  })

  describe("GetEmployeeSalaryStatsByDepartment", () => {
    it('will compute salary stats by department', async () => {
      prismaMock.employee.findMany.mockResolvedValue(employeeData)
      const req: Partial<Request> = {}
      const res: Partial<Response> = {
        json: jest.fn(),
      }

      await getEmployeeSalaryStatsByDepartment(req as Request, res as Response)
      expect(res.json).toBeCalledWith({
        "Engineering": {
          mean: 40099006,
          min: 30,
          max: 200000000,
        },
        "Banking": {
          mean: 90000,
          min: 90000,
          max: 90000,
        },
        "Operations": {
          mean: 35015,
          min: 30,
          max: 70000,
        },
        "Administration": {
          mean: 30,
          min: 30,
          max: 30,
        }
      })
    });
  });

  describe("GetEmployeeSalaryStatsBySubDepartment", () => {
    it('will compute salary stats by sub-department', async () => {
      prismaMock.employee.findMany.mockResolvedValue(employeeData)
      const req: Partial<Request> = {}
      const res: Partial<Response> = {
        json: jest.fn(),
      }

      await getEmployeeSalaryStatsBySubDepartment(req as Request, res as Response)
      expect(res.json).toBeCalledWith({
        "Engineering": {
          "Platform": {
            mean: 40099006,
            min: 30,
            max: 200000000,
          },
        },
        "Banking": {
          "Loan": {
            mean: 90000,
            min: 90000,
            max: 90000,
          },
        },
        "Operations": {
          "CustomerOnboarding": {
            mean: 35015,
            min: 30,
            max: 70000,
          },
        },
        "Administration": {
          "Agriculture": {
            mean: 30,
            min: 30,
            max: 30,
          },
        },
      })
    });
  });
})
