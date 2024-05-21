import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  await prisma.role.upsert({
    where: { roleName: 'Candidate' },
    update: {},
    create: {
      roleName: 'Candidate'
    }
  })

  await prisma.role.upsert({
    where: { roleName: 'Employee' },
    update: {},
    create: {
      roleName: 'Employee'
    }
  })
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
