import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import Drama from '@/models/Drama';
import Act from '@/models/Act';
import Scene from '@/models/Scene';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const { id } = await params;
    const drama = await Drama.findById(id).populate('authorId', 'name email image');
    if (!drama) {
      return NextResponse.json({ error: 'Drama not found' }, { status: 404 });
    }

    const acts = await Act.find({ dramaId: id }).sort({ order: 1 });
    const actIds = acts.map((a) => a._id);
    const scenes = await Scene.find({ actId: { $in: actIds } }).sort({ order: 1 });

    return NextResponse.json({ drama, acts, scenes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching drama:", error);
    return NextResponse.json({ error: "Failed to fetch drama." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const allowedFields = ['title', 'type', 'description', 'coverImage', 'status'];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (updates.status === 'published' && drama.status !== 'published') {
      updates.publishedAt = new Date();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updated = await Drama.findByIdAndUpdate(id, { $set: updates }, { new: true }).populate('authorId', 'name email image');

    return NextResponse.json({ drama: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating drama:", error);
    return NextResponse.json({ error: "Failed to update drama." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const acts = await Act.find({ dramaId: id });
    const actIds = acts.map((a) => a._id);
    await Scene.deleteMany({ actId: { $in: actIds } });
    await Act.deleteMany({ dramaId: id });
    await Drama.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Drama deleted' }, { status: 200 });
  } catch (error) {
    console.error("Error deleting drama:", error);
    return NextResponse.json({ error: "Failed to delete drama." }, { status: 500 });
  }
}
