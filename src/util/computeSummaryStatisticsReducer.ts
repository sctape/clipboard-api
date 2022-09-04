import {SummaryStatistics} from "./types";
import {Employee} from "@prisma/client";

export const computeSummaryStatisticsReducer = (stats: SummaryStatistics, employee: Employee, currentIndex: Number, employees: Employee[]) => {
  const salary = Number(employee.salary);

  // sum the salaries to average at the end of the reduction
  stats.mean += salary

  if (stats.min === undefined || salary < stats.min) {
    stats.min = salary
  }

  if (stats.max === undefined || salary > stats.max) {
    stats.max = salary
  }

  // compute the average if at the end of the array
  if (currentIndex === employees.length - 1) {
    stats.mean = stats.mean/employees.length
  }

  return stats
}