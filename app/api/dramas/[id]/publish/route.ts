import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import Drama from '@/models/Drama';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const drama = await Drama.findById(id);
    if (!drama) {
      return NextResponse.json({ error: 'Drama not found' }, { status: 404 });
    }

    if (drama.authorId.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (drama.actsCount === 0) {
      return NextResponse.json({ error: 'Drama must have at least one act to publish' }, { status: 400 });
    }

    drama.status = 'published';
    drama.publishedAt = new Date();
    await drama.save();

    return NextResponse.json({ drama }, { status: 200 });
  } catch (error) {
    console.error("Error publishing drama:", error);
    return NextResponse.json({ error: "Failed to publish drama." }, { status: 500 });
  }
}
