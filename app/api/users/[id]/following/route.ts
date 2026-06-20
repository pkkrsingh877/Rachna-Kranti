import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import Follow from '@/models/Follow';

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

    const follows = await Follow.find({ followerId: id })
      .populate('followingId', 'name email image username bio')
      .sort({ createdAt: -1 })
      .lean();

    const users = follows.map((f) => (f as Record<string, unknown>).followingId);
    return NextResponse.json(users);
  } catch (error) {
    console.error('GET following error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
