import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import { Content } from '@/models/Content';
import Like from '@/models/Like';
import Notification from '@/models/Notification';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const like = await Like.findOne({ contentId: id, userId: user._id });
    const content = await Content.findById(id).select('likesCount');
    const likesCount = content?.likesCount ?? 0;

    return NextResponse.json({ liked: !!like, likesCount });
  } catch (error) {
    console.error('GET like error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const content = await Content.findById(id);
    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const existing = await Like.findOne({ contentId: id, userId: user._id });
    if (existing) {
      return NextResponse.json({ liked: true, likesCount: content.likesCount });
    }

    await Like.create({ contentId: id, userId: user._id });
    const updated = await Content.findByIdAndUpdate(
      id,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    if (content.authorId.toString() !== user._id.toString()) {
      await Notification.create({
        type: 'like',
        recipientId: content.authorId,
        senderId: user._id,
        contentId: id,
      });
    }

    return NextResponse.json({ liked: true, likesCount: updated?.likesCount ?? 0 });
  } catch (error) {
    console.error('POST like error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await Like.findOneAndDelete({ contentId: id, userId: user._id });
    const updated = await Content.findByIdAndUpdate(
      id,
      { $inc: { likesCount: -1 } },
      { new: true }
    );

    return NextResponse.json({ liked: false, likesCount: updated?.likesCount ?? 0 });
  } catch (error) {
    console.error('DELETE like error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
