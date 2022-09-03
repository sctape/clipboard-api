import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const employeeData: Prisma.EmployeeCreateInput[] = [
  {
    "name": "Abhishek",
    "salary": "145000",
    "currency": "USD",
    "department": "Engineering",
    "subDepartment": "Platform"
  },
  {
    "name": "Anurag",
    "salary": "90000",
    "currency": "USD",
    "department": "Banking",
    "onContract": true,
    "subDepartment": "Loan"
  },
  {
    "name": "Himani",
    "salary": "240000",
    "currency": "USD",
    "department": "Engineering",
    "subDepartment": "Platform"
  },
]

async function main() {
  console.log(`Start seeding ...`)
  for (const e of employeeData) {
    const employee = await prisma.employee.create({
      data: e,
    })
    console.log(`Created employee with id: ${employee.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
