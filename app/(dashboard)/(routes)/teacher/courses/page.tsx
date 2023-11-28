import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DataTable } from './_components/data-table';
import { columns } from './_components/columns';
import { redirect } from 'next/navigation';
import { prismadb } from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';

const CoursesPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const courses = await prismadb.course.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className='p-6'>
      <DataTable columns={columns} data={courses} />
    </div>
  );
};

export default CoursesPage;
