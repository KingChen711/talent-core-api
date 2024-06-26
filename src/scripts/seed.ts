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

  await prisma.job.createMany({
    data: [
      {
        createdAt: getRandomPastDate(),
        code: 'Fr_React_DEV',
        name: 'Fresher React Developer',
        description: 'Lập trình viên React Fresher',
        color: '#00dffd',
        icon: 'react.png'
      },

      {
        createdAt: getRandomPastDate(),
        code: 'Ju_NET_DEV',
        name: 'Junior .NET Developer',
        description: 'Lập trình viên .NET Junior',
        color: '#5c2d91',
        icon: 'dotnet.png'
      },
      {
        createdAt: getRandomPastDate(),
        code: 'Fin_Ana',
        name: 'Financial Analyst',
        description: 'Phân tích tài chính ',
        color: '#eab04d',
        icon: 'coin.png'
      },
      {
        createdAt: getRandomPastDate(),
        code: 'Se_UIUX_Des',
        name: 'UI/UX Designer',
        description: 'Thiết kế UI/UX Senior',
        color: '#29c5ee',
        icon: 'figma.png'
      },
      {
        createdAt: getRandomPastDate(),
        code: 'Se_Cy_Sec',
        name: 'Senior Cyber Security',
        description: 'An Ninh Mạng Senior',
        color: '#19c8a7',
        icon: 'security.png'
      },
      {
        createdAt: getRandomPastDate(),
        code: 'Se_BA',
        name: 'Senior Business Analyst',
        description: 'Phân tích nghiệp vụ Senior',
        color: '#cf1a2c'
      },
      {
        createdAt: getRandomPastDate(),
        code: 'Se_Angular_DEV',
        name: 'Senior Angular Developer',
        description: 'Lập trình viên FE Senior',
        color: '#c3002e',
        icon: 'angular.png'
      },
      {
        createdAt: getRandomPastDate(),
        code: 'Se_React_DEV',
        name: 'Senior React Developer',
        description: 'Lập trình viên React Senior',
        color: '#00dffd',
        icon: 'react.png'
      },

      {
        createdAt: getRandomPastDate(),
        code: 'It_NET_DEV',
        name: 'Intern .NET Developer',
        description: 'Lập trình viên .NET Intern',
        color: '#5c2d91',
        icon: 'dotnet.png'
      },
      {
        createdAt: getRandomPastDate(),
        code: 'Fr_UIUX_Des',
        name: 'UI/UX Designer Fresher',
        description: 'Thiết kế UI/UX Fresher',
        color: '#29c5ee',
        icon: 'figma.png'
      },
      {
        createdAt: getRandomPastDate(),
        code: 'Ju_BA',
        name: 'Junior Business Analyst',
        description: 'Phân tích nghiệp vụ Junior',
        color: '#cf1a2c'
      },
      {
        createdAt: getRandomPastDate(),
        code: 'It_Angular_DEV1',
        name: 'Intern Angular Developer',
        description: 'Lập trình viên FE Intern',
        color: '#c3002e',
        icon: 'angular.png'
      }
    ]
  })

  // await prisma.testExam.createMany({
  //   data: [
  //     {
  //       createdAt: getRandomPastDate(),
  //       code: 'Fr_React_Test',
  //       name: 'Fresher React Test',
  //       description: 'Lập trình viên React Fresher',
  //       conditionPoint: 7.3,
  //       duration: 90
  //     },
  //     {
  //       createdAt: getRandomPastDate(),
  //       code: 'Se_Node_Test',
  //       name: 'Senior NodeJs Test',
  //       description: 'Lập trình viên NodeJs Senior',
  //       conditionPoint: 6.5,
  //       duration: 120
  //     },
  //     {
  //       createdAt: getRandomPastDate(),
  //       code: 'In_NET_Test',
  //       name: 'Intern .NET Test',
  //       description: 'Lập trình viên .NET Intern',
  //       conditionPoint: 7.6,
  //       duration: 50
  //     }
  //   ]
  // })
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

function getRandomPastDate(): Date {
  const today = new Date()
  const pastDays = Math.floor(Math.random() * 30)
  today.setDate(today.getDate() - pastDays)
  return today
}
