import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import Book from '@/models/Book';
import Chapter from '@/models/Chapter';

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
    const book = await Book.findById(id);
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (book.authorId.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const chapterCount = await Chapter.countDocuments({ bookId: id });
    if (chapterCount === 0) {
      return NextResponse.json({ error: 'Book must have at least one chapter to publish' }, { status: 400 });
    }

    book.status = 'published';
    book.publishedAt = new Date();
    await book.save();

    return NextResponse.json({ book }, { status: 200 });
  } catch (error) {
    console.error("Error publishing book:", error);
    return NextResponse.json({ error: "Failed to publish book." }, { status: 500 });
  }
}
