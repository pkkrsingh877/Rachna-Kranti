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

    return NextResponse.json({ act, scenes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching act:", error);
    return NextResponse.json({ error: "Failed to fetch act." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; actId: string }> }) {
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
    const allowedFields = ['title', 'order'];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updated = await Act.findByIdAndUpdate(actId, { $set: updates }, { new: true });

    return NextResponse.json({ act: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating act:", error);
    return NextResponse.json({ error: "Failed to update act." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; actId: string }> }) {
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

    const sceneCount = await Scene.countDocuments({ actId });
    await Scene.deleteMany({ actId });
    await Act.findByIdAndDelete(actId);

    await Drama.findByIdAndUpdate(id, { $inc: { actsCount: -1, scenesCount: -sceneCount } });

    await Act.updateMany(
      { dramaId: id, order: { $gt: act.order } },
      { $inc: { order: -1 } }
    );

    return NextResponse.json({ message: 'Act deleted' }, { status: 200 });
  } catch (error) {
    console.error("Error deleting act:", error);
    return NextResponse.json({ error: "Failed to delete act." }, { status: 500 });
  }
}
