import { Employee } from '@prisma/client'

export interface SummaryStatistics {
  mean: number
  min?: number
  max?: number
}

export interface SummaryStatisticsByDepartment {
  [department: string]: SummaryStatistics
}

export interface SummaryStatisticsBySubDepartment {
  [department: string]: { [subDepartment: string]: SummaryStatistics }
}

export interface EmployeesByDepartment {
  [department: string]: Employee[]
}

export interface EmployeesBySubDepartment {
  [department: string]: { [subDepartment: string]: Employee[] }
}
