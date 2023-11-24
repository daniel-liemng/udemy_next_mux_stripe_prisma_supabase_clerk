import { prismadb } from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  try {
    const { userId } = auth();

    const body = await req.json();
    const { title } = body;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const course = await prismadb.course.create({
      data: {
        userId,
        title,
      },
    });

    return NextResponse.json(course);
  } catch (err) {
    console.log('[COURSES_POST]', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
};
