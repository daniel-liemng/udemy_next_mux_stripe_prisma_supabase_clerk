import { prismadb } from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export const POST = async (
  req: Request,
  { params }: { params: { courseId: string } }
) => {
  try {
    const { userId } = auth();

    const body = await req.json();
    const { title } = body;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const courseOwner = await prismadb.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });

    if (!courseOwner) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const lastChapter = await prismadb.chapter.findFirst({
      where: {
        courseId: params.courseId,
      },
      orderBy: {
        position: 'desc',
      },
    });

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    const chapter = await prismadb.chapter.create({
      data: {
        title,
        position: newPosition,
        courseId: params.courseId,
      },
    });

    return NextResponse.json(chapter);
  } catch (err) {
    console.log('[COURSEID_CHAPTERS_POST]', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
};
