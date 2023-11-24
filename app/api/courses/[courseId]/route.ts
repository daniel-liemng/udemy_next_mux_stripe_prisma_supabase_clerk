import { prismadb } from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export const PATCH = async (
  req: Request,
  { params }: { params: { courseId: string } }
) => {
  try {
    const { userId } = auth();

    const values = await req.json();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const course = await prismadb.course.update({
      where: {
        id: params.courseId,
        userId,
      },
      data: {
        ...values,
      },
    });

    return NextResponse.json(course);
  } catch (err) {
    console.log('[COURSEID_PATCH]', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
};
