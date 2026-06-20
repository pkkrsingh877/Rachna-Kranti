import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import Book from '@/models/Book';
import Chapter from '@/models/Chapter';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; chapterId: string }> }) {
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

    const { id, chapterId } = await params;
    const book = await Book.findById(id);
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (book.authorId.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const chapter = await Chapter.findById(chapterId);
    if (!chapter || chapter.bookId.toString() !== id) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
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

    const updated = await Chapter.findByIdAndUpdate(chapterId, { $set: updates }, { new: true });

    return NextResponse.json({ chapter: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating chapter:", error);
    return NextResponse.json({ error: "Failed to update chapter." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; chapterId: string }> }) {
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

    const { id, chapterId } = await params;
    const book = await Book.findById(id);
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (book.authorId.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const chapter = await Chapter.findById(chapterId);
    if (!chapter || chapter.bookId.toString() !== id) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    await Chapter.findByIdAndDelete(chapterId);

    const remaining = await Chapter.countDocuments({ bookId: id });
    await Book.findByIdAndUpdate(id, { chapterCount: remaining });

    await Chapter.updateMany(
      { bookId: id, order: { $gt: chapter.order } },
      { $inc: { order: -1 } }
    );

    return NextResponse.json({ message: 'Chapter deleted' }, { status: 200 });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return NextResponse.json({ error: "Failed to delete chapter." }, { status: 500 });
  }
}
