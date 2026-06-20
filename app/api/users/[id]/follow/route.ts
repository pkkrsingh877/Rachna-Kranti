import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import Follow from '@/models/Follow';
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

    const follow = await Follow.findOne({ followerId: user._id, followingId: id });
    return NextResponse.json({ following: !!follow });
  } catch (error) {
    console.error('GET follow error:', error);
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

    if (user._id.toString() === id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existing = await Follow.findOne({ followerId: user._id, followingId: id });
    if (existing) {
      return NextResponse.json({ following: true });
    }

    await Follow.create({ followerId: user._id, followingId: id });

    await Notification.create({
      type: 'follow',
      recipientId: id,
      senderId: user._id,
    });

    return NextResponse.json({ following: true });
  } catch (error) {
    console.error('POST follow error:', error);
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

    await Follow.findOneAndDelete({ followerId: user._id, followingId: id });
    return NextResponse.json({ following: false });
  } catch (error) {
    console.error('DELETE follow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
