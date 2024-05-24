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

  if (!(await prisma.job.findFirst())) await prisma.job.findFirst()
  {
    await prisma.job.createMany({
      data: [
        {
          code: 'Fr_React_DEV',
          name: 'Fresher React Developer',
          description: 'Lập trình viên React Fresher',
          color: '#00dffd',
          icon: '/icons/jobs/react.png'
        },

        {
          code: 'Ju_NET_DEV',
          name: 'Junior .NET Developer',
          description: 'Lập trình viên .NET Junior',
          color: '#5c2d91',
          icon: '/icons/jobs/dotnet.png'
        },
        {
          code: 'Fin_Ana',
          name: 'Financial Analyst',
          description: 'Phân tích tài chính ',
          color: '#eab04d',
          icon: '/icons/jobs/coin.png'
        },
        {
          code: 'Se_UIUX_Des',
          name: 'UI/UX Designer',
          description: 'Thiết kế UI/UX Senior',
          color: '#29c5ee',
          icon: '/icons/jobs/figma.png'
        },
        {
          code: 'Se_Cy_Sec',
          name: 'Senior Cyber Security',
          description: 'An Ninh Mạng Senior',
          color: '#19c8a7',
          icon: '/icons/jobs/security.png'
        },
        {
          code: 'Se_BA',
          name: 'Senior Business Analyst',
          description: 'Phân tích nghiệp vụ Senior',
          color: '#cf1a2c'
        },
        {
          code: 'Se_Angular_DEV',
          name: 'Senior Angular Developer',
          description: 'Lập trình viên FE Senior',
          color: '#c3002e',
          icon: '/icons/jobs/angular.png'
        }
      ]
    })
  }
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
