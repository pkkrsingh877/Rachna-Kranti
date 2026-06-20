import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import Drama from '@/models/Drama';
import Act from '@/models/Act';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const { id } = await params;
    const acts = await Act.find({ dramaId: id }).sort({ order: 1 });

    return NextResponse.json({ acts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching acts:", error);
    return NextResponse.json({ error: "Failed to fetch acts." }, { status: 500 });
  }
}

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

    const body = await request.json();
    const { title, order } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const nextOrder = order ?? (await Act.countDocuments({ dramaId: id })) + 1;

    const act = await Act.create({
      dramaId: id,
      title: title.trim(),
      order: nextOrder,
    });

    await Drama.findByIdAndUpdate(id, { $inc: { actsCount: 1 } });

    return NextResponse.json({ act }, { status: 201 });
  } catch (error) {
    console.error("Error creating act:", error);
    return NextResponse.json({ error: "Failed to create act." }, { status: 500 });
  }
}
