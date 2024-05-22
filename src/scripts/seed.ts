import { db } from '~/lib/db'

async function main() {
  await db.role.upsert({
    where: { roleName: 'Candidate' },
    update: {},
    create: {
      roleName: 'Candidate'
    }
  })

  await db.role.upsert({
    where: { roleName: 'Employee' },
    update: {},
    create: {
      roleName: 'Employee'
    }
  })
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
