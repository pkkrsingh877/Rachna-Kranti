import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import Drama from '@/models/Drama';
import Act from '@/models/Act';
import Scene from '@/models/Scene';

export async function GET(request: Request, { params }: { params: Promise<{ id: string; actId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const { id, actId } = await params;
    const act = await Act.findById(actId);
    if (!act || act.dramaId.toString() !== id) {
      return NextResponse.json({ error: 'Act not found' }, { status: 404 });
    }

    const scenes = await Scene.find({ actId }).sort({ order: 1 });

    return NextResponse.json({ scenes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching scenes:", error);
    return NextResponse.json({ error: "Failed to fetch scenes." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string; actId: string }> }) {
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

    const { id, actId } = await params;
    const drama = await Drama.findById(id);
    if (!drama) {
      return NextResponse.json({ error: 'Drama not found' }, { status: 404 });
    }

    if (drama.authorId.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const act = await Act.findById(actId);
    if (!act || act.dramaId.toString() !== id) {
      return NextResponse.json({ error: 'Act not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, content, order } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const nextOrder = order ?? (await Scene.countDocuments({ actId })) + 1;

    const scene = await Scene.create({
      dramaId: id,
      actId,
      title: title.trim(),
      order: nextOrder,
      content: content || [],
    });

    await Drama.findByIdAndUpdate(id, { $inc: { scenesCount: 1 } });

    return NextResponse.json({ scene }, { status: 201 });
  } catch (error) {
    console.error("Error creating scene:", error);
    return NextResponse.json({ error: "Failed to create scene." }, { status: 500 });
  }
}
