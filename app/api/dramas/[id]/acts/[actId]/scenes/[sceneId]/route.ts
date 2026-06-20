import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import Drama from '@/models/Drama';
import Scene from '@/models/Scene';

export async function GET(request: Request, { params }: { params: Promise<{ id: string; actId: string; sceneId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const { id, actId, sceneId } = await params;
    const scene = await Scene.findById(sceneId);
    if (!scene || scene.dramaId.toString() !== id || scene.actId.toString() !== actId) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    return NextResponse.json({ scene }, { status: 200 });
  } catch (error) {
    console.error("Error fetching scene:", error);
    return NextResponse.json({ error: "Failed to fetch scene." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; actId: string; sceneId: string }> }) {
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

    const { id, actId, sceneId } = await params;
    const drama = await Drama.findById(id);
    if (!drama) {
      return NextResponse.json({ error: 'Drama not found' }, { status: 404 });
    }

    if (drama.authorId.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const scene = await Scene.findById(sceneId);
    if (!scene || scene.dramaId.toString() !== id || scene.actId.toString() !== actId) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    const body = await request.json();
    const allowedFields = ['title', 'content', 'order'];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updated = await Scene.findByIdAndUpdate(sceneId, { $set: updates }, { new: true });

    return NextResponse.json({ scene: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating scene:", error);
    return NextResponse.json({ error: "Failed to update scene." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; actId: string; sceneId: string }> }) {
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

    const { id, actId, sceneId } = await params;
    const drama = await Drama.findById(id);
    if (!drama) {
      return NextResponse.json({ error: 'Drama not found' }, { status: 404 });
    }

    if (drama.authorId.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const scene = await Scene.findById(sceneId);
    if (!scene || scene.dramaId.toString() !== id || scene.actId.toString() !== actId) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    await Scene.findByIdAndDelete(sceneId);
    await Drama.findByIdAndUpdate(id, { $inc: { scenesCount: -1 } });

    await Scene.updateMany(
      { actId, order: { $gt: scene.order } },
      { $inc: { order: -1 } }
    );

    return NextResponse.json({ message: 'Scene deleted' }, { status: 200 });
  } catch (error) {
    console.error("Error deleting scene:", error);
    return NextResponse.json({ error: "Failed to delete scene." }, { status: 500 });
  }
}
