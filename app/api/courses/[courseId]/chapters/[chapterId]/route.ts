import { prismadb } from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!
);

export const PATCH = async (
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) => {
  try {
    const { userId } = auth();

    // isPublished is controlled by other api, exclude it here
    const { isPublished, ...values } = await req.json();

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

    const chapter = await prismadb.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      data: {
        ...values,
      },
    });

    // Handle video upload - MUX
    if (values.videoUrl) {
      const existingMuxData = await prismadb.muxData.findFirst({
        where: {
          chapterId: params.chapterId,
        },
      });

      if (existingMuxData) {
        await Video.Assets.del(existingMuxData.assetId);
        await prismadb.muxData.delete({
          where: {
            id: existingMuxData.id,
          },
        });
      }

      const asset = await Video.Assets.create({
        input: values.videoUrl,
        playback_policy: 'public',
        test: false,
      });

      await prismadb.muxData.create({
        data: {
          chapterId: params.chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id,
        },
      });
    }

    return NextResponse.json(chapter);
  } catch (err) {
    console.log('[CHAPTER_ID_PATCH]', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) => {
  try {
    const { userId } = auth();

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

    const chapter = await prismadb.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
    });

    if (!chapter) {
      return new NextResponse('Not Found', { status: 404 });
    }

    if (chapter.videoUrl) {
      const existingMuxData = await prismadb.muxData.findFirst({
        where: {
          chapterId: params.chapterId,
        },
      });

      // delete video in Mux Account & prisma DB
      if (existingMuxData) {
        await Video.Assets.del(existingMuxData.assetId);
        await prismadb.muxData.delete({
          where: {
            id: existingMuxData.id,
          },
        });
      }
    }

    const deletedChapter = await prismadb.chapter.delete({
      where: {
        id: params.chapterId,
      },
    });

    // A course is published if at least one chapter is active (published)
    // Check this: after deleting this chapter, there is still one active chapter  --> delete this chapter means unpublishing the entire course
    const publishedChaptersInCourse = await prismadb.chapter.findMany({
      where: {
        id: params.chapterId,
        isPublished: true,
      },
    });

    if (!publishedChaptersInCourse.length) {
      await prismadb.course.update({
        where: {
          id: params.courseId,
        },
        data: {
          isPublished: false,
        },
      });
    }

    return NextResponse.json(deletedChapter);
  } catch (err) {
    console.log('[CHAPTER_ID_DELETE]', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
};
