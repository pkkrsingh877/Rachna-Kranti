import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const unread = searchParams.get('unread');

    await connectToDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (unread === 'true') {
      const count = await Notification.countDocuments({ recipientId: user._id, read: false });
      return NextResponse.json({ count });
    }

    const notifications = await Notification.find({ recipientId: user._id })
      .populate('senderId', 'name image')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('GET notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));

    if (body.id) {
      await Notification.findOneAndUpdate(
        { _id: body.id, recipientId: user._id },
        { read: true }
      );
    } else {
      await Notification.updateMany(
        { recipientId: user._id, read: false },
        { read: true }
      );
    }

    return NextResponse.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('PATCH notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
