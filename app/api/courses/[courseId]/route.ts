import { prismadb } from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import Mux from '@mux/mux-node';

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!
);

export const DELETE = async (
  req: Request,
  { params }: { params: { courseId: string } }
) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const course = await prismadb.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
      include: {
        chapters: {
          include: {
            muxData: true,
          },
        },
      },
    });

    if (!course) {
      return new NextResponse('Course Not Found', { status: 404 });
    }

    // Delete Mux Video
    for (const chapter of course.chapters) {
      if (chapter.muxData?.assetId) {
        await Video.Assets.del(chapter.muxData.assetId);
      }
    }

    const deletedCourse = await prismadb.course.delete({
      where: {
        id: params.courseId,
      },
    });

    return NextResponse.json(deletedCourse);
  } catch (err) {
    console.log('[COURSEID_DELETE]', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
};

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
