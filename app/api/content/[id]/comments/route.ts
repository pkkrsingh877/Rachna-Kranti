import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import { Content } from '@/models/Content';
import Comment from '@/models/Comment';
import Notification from '@/models/Notification';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDB();

    const comments = await Comment.find({ contentId: id })
      .populate('authorId', 'name image')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(comments);
  } catch (error) {
    console.error('GET comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { text, parentId } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
    }

    if (text.length > 2000) {
      return NextResponse.json({ error: 'Comment too long (max 2000 chars)' }, { status: 400 });
    }

    await connectToDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const content = await Content.findById(id);
    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const comment = await Comment.create({
      contentId: id,
      authorId: user._id,
      text: text.trim(),
      parentId: parentId || null,
    });

    await Content.findByIdAndUpdate(id, { $inc: { commentsCount: 1 } });

    const populated = await Comment.findById(comment._id)
      .populate('authorId', 'name image')
      .lean();

    if (content.authorId.toString() !== user._id.toString()) {
      await Notification.create({
        type: parentId ? 'reply' : 'comment',
        recipientId: parentId
          ? (await Comment.findById(parentId)).authorId
          : content.authorId,
        senderId: user._id,
        contentId: id,
      });
    }

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error('POST comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
