import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // await prisma.role.upsert({
  //   where: { roleName: 'Candidate' },
  //   update: {},
  //   create: {
  //     roleName: 'Candidate'
  //   }
  // })

  // await prisma.role.upsert({
  //   where: { roleName: 'Employee' },
  //   update: {},
  //   create: {
  //     roleName: 'Employee'
  //   }
  // })
  await prisma.user.create({
    data: {
      clerkId: '',
      email: 'kingchenobama711@gmail.com',
      roleId: '664cb98ae864f3225e320899'
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
  .finally(() => console.log('Done'))
