const { PrismaClient } = require('@prisma/client');

const database = new PrismaClient();

const main = async () => {
  try {
    await database.category.createMany({
      data: [
        { name: 'Computer Science' },
        { name: 'Music' },
        { name: 'Fitness' },
        { name: 'Photography' },
        { name: 'Accounting' },
        { name: 'Engineering' },
        { name: 'Filming' },
      ],
    });

    console.log('Success');
  } catch (err) {
    console.log('Error seeding the database categories', err);
  } finally {
    await database.$disconnect();
  }
};

main();
