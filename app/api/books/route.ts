import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import Book from '@/models/Book';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'published';
    const author = searchParams.get('author');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'recent';

    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (author) filter.authorId = author;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      recent: { createdAt: -1 },
      oldest: { createdAt: 1 },
      title: { title: 1 },
    };

    const skip = (page - 1) * limit;

    const [books, total] = await Promise.all([
      Book.find(filter)
        .sort(sortMap[sort] || { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'name email image'),
      Book.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);
    const previous = page > 1 ? `/api/books?page=${page - 1}&limit=${limit}` : null;
    const next = page < totalPages ? `/api/books?page=${page + 1}&limit=${limit}` : null;

    return NextResponse.json({ count: total, previous, next, results: books }, { status: 200 });
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json({ error: "Failed to fetch books." }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { title, type, subtitle, description, coverImage, tags, status } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const book = await Book.create({
      title: title.trim(),
      authorId: user._id,
      type: type || 'General',
      subtitle,
      description,
      coverImage,
      tags,
      status: status || 'draft',
    });

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json({ error: "Failed to create book." }, { status: 500 });
  }
}
