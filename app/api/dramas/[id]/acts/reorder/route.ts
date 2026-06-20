import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import Drama from '@/models/Drama';
import Act from '@/models/Act';

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
    const { orders } = body;

    if (!Array.isArray(orders)) {
      return NextResponse.json({ error: 'orders must be an array of { id, order }' }, { status: 400 });
    }

    const updates = orders.map((item: { id: string; order: number }) =>
      Act.findByIdAndUpdate(item.id, { order: item.order })
    );

    await Promise.all(updates);

    return NextResponse.json({ message: 'Acts reordered' }, { status: 200 });
  } catch (error) {
    console.error("Error reordering acts:", error);
    return NextResponse.json({ error: "Failed to reorder acts." }, { status: 500 });
  }
}
