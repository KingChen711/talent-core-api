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

  if (!(await prisma.job.findFirst())) {
    await prisma.job.createMany({
      data: getJobs()
    })
  }

  // await prisma.testExam.create({
  //   data: {
  //     createdAt: getRandomPastDate(),
  //     code: 'DSA_Test',
  //     name: 'Data Structure and Algorithm Test',
  //     description: 'A test to assess knowledge in data structures and algorithms.',
  //     conditionPoint: 7.5,
  //     duration: 90,
  //     questions: {
  //       createMany: {
  //         data: [
  //           {
  //             content: `<p>Which data structure uses LIFO (Last In First Out) principle?</p>`,
  //             options: [
  //               {
  //                 content: 'Queue',
  //                 correct: false
  //               },
  //               {
  //                 content: 'Stack',
  //                 correct: true
  //               },
  //               {
  //                 content: 'Heap',
  //                 correct: false
  //               },
  //               {
  //                 content: 'Tree',
  //                 correct: false
  //               }
  //             ]
  //           },
  //           {
  //             content: '<p>What is the time complexity of inserting an element at the beginning of a linked list?</p>',
  //             options: [
  //               {
  //                 content: 'O(1)',
  //                 correct: true
  //               },
  //               {
  //                 content: 'O(n)',
  //                 correct: false
  //               },
  //               {
  //                 content: 'O(log n)',
  //                 correct: false
  //               },
  //               {
  //                 content: 'O(n log n)',
  //                 correct: false
  //               }
  //             ]
  //           },
  //           {
  //             content: '<p>Which algorithm is used to find the shortest path between nodes in a graph?</p>',
  //             options: [
  //               {
  //                 content: "Kruskal's Algorithm",
  //                 correct: false
  //               },
  //               {
  //                 content: "Dijkstra's Algorithm",
  //                 correct: true
  //               },
  //               {
  //                 content: "Prim's Algorithm",
  //                 correct: false
  //               },
  //               {
  //                 content: 'Depth First Search',
  //                 correct: false
  //               }
  //             ]
  //           },
  //           {
  //             content: '<p>What is the space complexity of merge sort?</p>',
  //             options: [
  //               {
  //                 content: 'O(1)',
  //                 correct: false
  //               },
  //               {
  //                 content: 'O(n)',
  //                 correct: false
  //               },
  //               {
  //                 content: 'O(log n)',
  //                 correct: false
  //               },
  //               {
  //                 content: 'O(n log n)',
  //                 correct: true
  //               }
  //             ]
  //           },
  //           {
  //             content: '<p>Which data structure is used for implementing recursion?</p>',
  //             options: [
  //               {
  //                 content: 'Queue',
  //                 correct: false
  //               },
  //               {
  //                 content: 'Stack',
  //                 correct: true
  //               },
  //               {
  //                 content: 'Array',
  //                 correct: false
  //               },
  //               {
  //                 content: 'Graph',
  //                 correct: false
  //               }
  //             ]
  //           },
  //           {
  //             content: '<p>What is the best case time complexity of quicksort?</p>',
  //             options: [
  //               {
  //                 content: 'O(n^2)',
  //                 correct: false
  //               },
  //               {
  //                 content: 'O(n log n)',
  //                 correct: true
  //               },
  //               {
  //                 content: 'O(log n)',
  //                 correct: false
  //               },
  //               {
  //                 content: 'O(n)',
  //                 correct: false
  //               }
  //             ]
  //           }
  //         ]
  //       }
  //     }
  //   }
  // })

  // await prisma.testExam.create({
  //   data: {
  //     createdAt: getRandomPastDate(),
  //     code: 'JavaScript_Test',
  //     name: 'JavaScript Test',
  //     description: 'A test to evaluate JavaScript knowledge.',
  //     conditionPoint: 7.3,
  //     duration: 90,
  //     questions: {
  //       createMany: {
  //         data: [
  //           {
  //             content: `<p>Which of the following is a correct way to declare a JavaScript variable?</p>`,
  //             options: [
  //               {
  //                 content: 'var myVar',
  //                 correct: true
  //               },
  //               {
  //                 content: 'variable myVar',
  //                 correct: false
  //               },
  //               {
  //                 content: 'let myVar;',
  //                 correct: true
  //               },
  //               {
  //                 content: 'const myVar;',
  //                 correct: true
  //               }
  //             ]
  //           },
  //           {
  //             content: '<p>Which company developed JavaScript?</p>',
  //             options: [
  //               {
  //                 content: 'Google',
  //                 correct: false
  //               },
  //               {
  //                 content: 'Microsoft',
  //                 correct: false
  //               },
  //               {
  //                 content: 'Netscape',
  //                 correct: true
  //               },
  //               {
  //                 content: 'IBM',
  //                 correct: false
  //               }
  //             ]
  //           },
  //           {
  //             content:
  //               '<p>What will the following code output?</p>\n<pre class="language-javascript"><code>console.log(typeof null);</code></pre>',
  //             options: [
  //               {
  //                 content: '"null"',
  //                 correct: false
  //               },
  //               {
  //                 content: '"undefined"',
  //                 correct: false
  //               },
  //               {
  //                 content: '"object"',
  //                 correct: true
  //               },
  //               {
  //                 content: '"number"',
  //                 correct: false
  //               }
  //             ]
  //           },
  //           {
  //             content: '<p>Which method is used to round a number to the nearest integer?</p>',
  //             options: [
  //               {
  //                 content: 'Math.round()',
  //                 correct: true
  //               },
  //               {
  //                 content: 'Math.ceil()',
  //                 correct: false
  //               },
  //               {
  //                 content: 'Math.floor()',
  //                 correct: false
  //               },
  //               {
  //                 content: 'Math.rnd()',
  //                 correct: false
  //               }
  //             ]
  //           },
  //           {
  //             content:
  //               '<p>What is the output of the following code?</p>\n<pre class="language-javascript"><code>const arr = [1, 2, 3];\nconsole.log(arr[3]);</code></pre>',
  //             options: [
  //               {
  //                 content: 'undefined',
  //                 correct: true
  //               },
  //               {
  //                 content: '3',
  //                 correct: false
  //               },
  //               {
  //                 content: '0',
  //                 correct: false
  //               },
  //               {
  //                 content: 'null',
  //                 correct: false
  //               }
  //             ]
  //           },
  //           {
  //             content: '<p>Which operator is used to assign a value to a variable?</p>',
  //             options: [
  //               {
  //                 content: '==',
  //                 correct: false
  //               },
  //               {
  //                 content: '=',
  //                 correct: true
  //               },
  //               {
  //                 content: '===',
  //                 correct: false
  //               },
  //               {
  //                 content: '!=',
  //                 correct: false
  //               }
  //             ]
  //           }
  //         ]
  //       }
  //     }
  //   }
  // })

  // await prisma.testExam.create({
  //   data: {
  //     createdAt: getRandomPastDate(),
  //     code: 'React_Test',
  //     name: 'React Test',
  //     description: '...',
  //     conditionPoint: 7.3,
  //     duration: 90,
  //     questions: {
  //       createMany: {
  //         data: [
  //           {
  //             content: `<p>What is the correct command to create a new React project?</p>`,
  //             options: [
  //               {
  //                 content: 'npx create-react-app',
  //                 correct: false
  //               },
  //               {
  //                 content: 'npx create-react-app my-app',
  //                 correct: true
  //               },
  //               {
  //                 content: 'npm create-react-app',
  //                 correct: false
  //               },
  //               {
  //                 content: 'npm create-react-app my-app',
  //                 correct: false
  //               }
  //             ]
  //           },
  //           {
  //             content: '<p>What is the default local host port that a React development server uses?</p>',
  //             options: [
  //               {
  //                 content: '3500',
  //                 correct: false
  //               },
  //               {
  //                 content: '8080',
  //                 correct: false
  //               },
  //               {
  //                 content: '5000',
  //                 correct: false
  //               },
  //               {
  //                 content: '3000',
  //                 correct: true
  //               }
  //             ]
  //           },
  //           {
  //             content:
  //               '<p>What type of element will be rendered from the following code?</p>\n<pre class="language-javascript"><code>function Car() {\n  return &lt;h1&gt;Ford Mustang&lt;/h1&gt;;\n}\n\nconst root = createRoot(document.getElementById(\'root\'));\nroot.render(&lt;Car /&gt;);</code></pre>',
  //             options: [
  //               {
  //                 content: 'ReactDom',
  //                 correct: false
  //               },
  //               {
  //                 content: 'div',
  //                 correct: false
  //               },
  //               {
  //                 content: 'h1',
  //                 correct: true
  //               },
  //               {
  //                 content: 'component',
  //                 correct: false
  //               }
  //             ]
  //           },
  //           {
  //             content: '<p>Which keyword creates a constant in JavaScript?</p>',
  //             options: [
  //               {
  //                 content: 'var',
  //                 correct: false
  //               },
  //               {
  //                 content: 'let',
  //                 correct: false
  //               },
  //               {
  //                 content: 'const',
  //                 correct: true
  //               },
  //               {
  //                 content: 'constant',
  //                 correct: false
  //               }
  //             ]
  //           },
  //           {
  //             content:
  //               "<p>What is the output of the following code?</p>\n<pre class=\"language-javascript\"><code>const make = 'Ford';\nconst model = 'Mustang';\nconst car = { make, model };\nconsole.log(car)</code></pre>",
  //             options: [
  //               {
  //                 content: "{{make: 'Ford', model: 'Mustang'}}",
  //                 correct: false
  //               },
  //               {
  //                 content: "{car: {make: 'Ford', model: 'Mustang'}}",
  //                 correct: false
  //               },
  //               {
  //                 content: "{make: 'Ford', model: 'Mustang'}",
  //                 correct: true
  //               },
  //               {
  //                 content: "{car: 'Ford', car: 'Mustang'}}",
  //                 correct: false
  //               }
  //             ]
  //           },
  //           {
  //             content: '<p>Which operator can be used to conditionally render a React component?</p>',
  //             options: [
  //               {
  //                 content: '??',
  //                 correct: false
  //               },
  //               {
  //                 content: '&&',
  //                 correct: true
  //               },
  //               {
  //                 content: '::',
  //                 correct: false
  //               },
  //               {
  //                 content: '||',
  //                 correct: false
  //               }
  //             ]
  //           }
  //         ]
  //       }
  //     }
  //   }
  // })

  // await prisma.testExam.create({
  //   data: {
  //     createdAt: getRandomPastDate(),
  //     code: 'NET_Test',
  //     name: '.NET Test',
  //     description: '...',
  //     conditionPoint: 7.3,
  //     duration: 90,
  //     questions: {
  //       createMany: {
  //         data: [
  //           {
  //             content: `<p>Which method is used to start a .NET application?</p>`,
  //             options: [
  //               {
  //                 content: 'Main()',
  //                 correct: true
  //               },
  //               {
  //                 content: 'Start()',
  //                 correct: false
  //               },
  //               {
  //                 content: 'Run()',
  //                 correct: false
  //               },
  //               {
  //                 content: 'Initialize()',
  //                 correct: false
  //               }
  //             ]
  //           },
  //           {
  //             content: '<p>Which of the following is a .NET framework for building web applications?</p>',
  //             options: [
  //               {
  //                 content: 'WinForms',
  //                 correct: false
  //               },
  //               {
  //                 content: 'WPF',
  //                 correct: false
  //               },
  //               {
  //                 content: 'ASP.NET',
  //                 correct: true
  //               },
  //               {
  //                 content: 'Xamarin',
  //                 correct: false
  //               }
  //             ]
  //           },
  //           {
  //             content: `<p>Which class is used to connect to a SQL database in .NET?</p>`,
  //             options: [
  //               {
  //                 content: 'SqlConnection',
  //                 correct: true
  //               },
  //               {
  //                 content: 'DatabaseConnection',
  //                 correct: false
  //               },
  //               {
  //                 content: 'SqlCommand',
  //                 correct: false
  //               },
  //               {
  //                 content: 'DataConnection',
  //                 correct: false
  //               }
  //             ]
  //           },
  //           {
  //             content: '<p>What is the base class for all exceptions in .NET?</p>',
  //             options: [
  //               {
  //                 content: 'System.Exception',
  //                 correct: true
  //               },
  //               {
  //                 content: 'System.SystemException',
  //                 correct: false
  //               },
  //               {
  //                 content: 'System.ApplicationException',
  //                 correct: false
  //               },
  //               {
  //                 content: 'System.ErrorException',
  //                 correct: false
  //               }
  //             ]
  //           },
  //           {
  //             content: `<p>Which of the following is used to handle unhandled exceptions in a .NET application?</p>`,
  //             options: [
  //               {
  //                 content: 'AppDomain.CurrentDomain.UnhandledException',
  //                 correct: true
  //               },
  //               {
  //                 content: 'Application.UnhandledException',
  //                 correct: false
  //               },
  //               {
  //                 content: 'Thread.UnhandledException',
  //                 correct: false
  //               },
  //               {
  //                 content: 'Exception.UnhandledException',
  //                 correct: false
  //               }
  //             ]
  //           },
  //           {
  //             content: '<p>Which keyword is used to define a method that must be implemented in a derived class?</p>',
  //             options: [
  //               {
  //                 content: 'virtual',
  //                 correct: false
  //               },
  //               {
  //                 content: 'abstract',
  //                 correct: true
  //               },
  //               {
  //                 content: 'static',
  //                 correct: false
  //               },
  //               {
  //                 content: 'override',
  //                 correct: false
  //               }
  //             ]
  //           }
  //         ]
  //       }
  //     }
  //   }
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

function getJobs() {
  return [
    {
      createdAt: getRandomPastDate(),
      code: 'Fr_React_DEV',
      name: 'Fresher React Developer',
      description:
        'As a Fresher React Developer, you will be responsible for developing user interface components using React.js. You should be eager to learn and improve your coding skills under the guidance of senior developers.',
      color: '#00dffd',
      icon: 'react.png'
    },
    {
      createdAt: getRandomPastDate(),
      code: 'Ju_NET_DEV',
      name: 'Junior .NET Developer',
      description:
        'As a Junior .NET Developer, you will assist in developing and maintaining software applications using the .NET framework. You should have basic knowledge of C# and be able to work in a team environment.',
      color: '#5c2d91',
      icon: 'dotnet.png'
    },
    {
      createdAt: getRandomPastDate(),
      code: 'Fin_Ana',
      name: 'Financial Analyst',
      description:
        'As a Financial Analyst, you will analyze financial data and trends to help the company make informed business decisions. Strong analytical skills and proficiency in financial software are required.',
      color: '#eab04d',
      icon: 'coin.png'
    },
    {
      createdAt: getRandomPastDate(),
      code: 'Se_UIUX_Des',
      name: 'UI/UX Designer',
      description:
        'As a Senior UI/UX Designer, you will be responsible for creating user-friendly and visually appealing designs for our web and mobile applications. You should have extensive experience in design tools like Figma and Adobe XD.',
      color: '#29c5ee',
      icon: 'figma.png'
    },
    {
      createdAt: getRandomPastDate(),
      code: 'Se_Cy_Sec',
      name: 'Senior Cyber Security Specialist',
      description:
        'As a Senior Cyber Security Specialist, you will ensure the security of our systems and data by identifying vulnerabilities and implementing robust security measures. Experience in cybersecurity protocols and tools is essential.',
      color: '#19c8a7',
      icon: 'security.png'
    },
    {
      createdAt: getRandomPastDate(),
      code: 'Se_BA',
      name: 'Senior Business Analyst',
      description:
        'As a Senior Business Analyst, you will analyze business processes and identify opportunities for improvement. You will work closely with stakeholders to gather requirements and propose solutions that align with business goals.',
      color: '#cf1a2c'
    },
    {
      createdAt: getRandomPastDate(),
      code: 'Se_Angular_DEV',
      name: 'Senior Angular Developer',
      description:
        'As a Senior Angular Developer, you will design and develop high-performance web applications using Angular. You should have deep knowledge of Angular and JavaScript frameworks and be able to mentor junior developers.',
      color: '#c3002e',
      icon: 'angular.png'
    },
    {
      createdAt: getRandomPastDate(),
      code: 'Se_React_DEV',
      name: 'Senior React Developer',
      description:
        'As a Senior React Developer, you will lead the development of complex user interfaces using React.js. You should have extensive experience in React and related technologies and be capable of guiding a team of developers.',
      color: '#00dffd',
      icon: 'react.png'
    },
    {
      createdAt: getRandomPastDate(),
      code: 'It_NET_DEV',
      name: 'Intern .NET Developer',
      description:
        'As an Intern .NET Developer, you will support the development team in creating software applications using the .NET framework. This role is ideal for someone looking to gain practical experience in .NET development.',
      color: '#5c2d91',
      icon: 'dotnet.png'
    },
    {
      createdAt: getRandomPastDate(),
      code: 'Fr_UIUX_Des',
      name: 'UI/UX Designer Fresher',
      description:
        'As a UI/UX Designer Fresher, you will assist in creating intuitive and attractive designs for our digital products. This role offers an excellent opportunity to learn and grow in the field of UI/UX design.',
      color: '#29c5ee',
      icon: 'figma.png'
    },
    {
      createdAt: getRandomPastDate(),
      code: 'Ju_BA',
      name: 'Junior Business Analyst',
      description:
        'As a Junior Business Analyst, you will support senior analysts in evaluating business processes and identifying areas for improvement. You should have strong analytical skills and a basic understanding of business analysis techniques.',
      color: '#cf1a2c'
    },
    {
      createdAt: getRandomPastDate(),
      code: 'It_Angular_DEV',
      name: 'Intern Angular Developer',
      description:
        'As an Intern Angular Developer, you will assist in developing web applications using Angular. This role provides a hands-on learning experience in Angular development under the mentorship of experienced developers.',
      color: '#c3002e',
      icon: 'angular.png'
    },
    {
      createdAt: getRandomPastDate(),
      code: 'Ju_Data_Sci',
      name: 'Junior Data Scientist',
      description:
        'As a Junior Data Scientist, you will assist in analyzing complex data sets to provide actionable insights. Proficiency in data analysis tools and programming languages such as Python or R is required.',
      color: '#00bfff',
      icon: 'data.png'
    },
    {
      createdAt: getRandomPastDate(),
      code: 'Se_Proj_Man',
      name: 'Senior Project Manager',
      description:
        'As a Senior Project Manager, you will oversee the planning and execution of large-scale projects. You should have extensive experience in project management methodologies and tools, and the ability to lead cross-functional teams.',
      color: '#ff6347',
      icon: 'project.png'
    },
    {
      createdAt: getRandomPastDate(),
      code: 'Fr_Mar_Exe',
      name: 'Marketing Executive Fresher',
      description:
        'As a Marketing Executive Fresher, you will support the marketing team in developing and executing marketing strategies. This role is perfect for someone looking to start a career in marketing and gain valuable industry experience.',
      color: '#ff7f50',
      icon: 'marketing.png'
    },
    {
      createdAt: getRandomPastDate(),
      code: 'Se_Data_Eng',
      name: 'Senior Data Engineer',
      description:
        'As a Senior Data Engineer, you will design, build, and maintain scalable data pipelines and architectures. You should have extensive experience in data engineering and be proficient in tools like SQL, Hadoop, and Spark.',
      color: '#4682b4',
      icon: 'data-engineering.png'
    },
    {
      createdAt: getRandomPastDate(),
      code: 'Ju_DevOps_Eng',
      name: 'Junior DevOps Engineer',
      description:
        'As a Junior DevOps Engineer, you will assist in automating and streamlining operations and processes. You should have basic knowledge of DevOps practices, cloud platforms, and scripting languages.',
      color: '#2e8b57',
      icon: 'devops.png'
    }
  ]
}
