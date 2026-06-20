import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import { Content } from '@/models/Content';
import { contentSchema } from '@/lib/schemas';

export async function GET(request: Request) {
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

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
        const sort = searchParams.get('sort') || 'recent';
        const type = searchParams.get('type');
        const status = searchParams.get('status') || 'published';
        const author = searchParams.get('author');
        const search = searchParams.get('search');

        const filter: Record<string, any> = { status };
        if (type) filter.contentType = type.charAt(0).toUpperCase() + type.slice(1);
        if (author) filter.authorId = author;
        if (search) filter.title = { $regex: search, $options: 'i' };

        const sortMap: Record<string, Record<string, 1 | -1>> = {
            recent: { createdAt: -1 },
            oldest: { createdAt: 1 },
            popular: { likesCount: -1 },
            title: { title: 1 },
        };

        const skip = (page - 1) * limit;

        const baseUrl = `${request.url.split('?')[0]}`;
        const queryParts: string[] = [];
        if (type) queryParts.push(`type=${encodeURIComponent(type)}`);
        if (status) queryParts.push(`status=${encodeURIComponent(status)}`);
        if (author) queryParts.push(`author=${encodeURIComponent(author)}`);
        if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
        if (sort && sort !== 'recent') queryParts.push(`sort=${encodeURIComponent(sort)}`);
        const queryBase = queryParts.join('&');

        const [contents, total] = await Promise.all([
            Content.find(filter)
                .populate('authorId', 'name email image')
                .sort(sortMap[sort] || sortMap.recent)
                .skip(skip)
                .limit(limit),
            Content.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / limit);
        const previous = page > 1 ? `${baseUrl}?limit=${limit}&page=${page - 1}${queryBase ? `&${queryBase}` : ''}` : null;
        const next = page < totalPages ? `${baseUrl}?limit=${limit}&page=${page + 1}${queryBase ? `&${queryBase}` : ''}` : null;

        return NextResponse.json({
            count: total,
            previous,
            next,
            results: contents,
        }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: "Failed to fetch data." }, { status: 500 });
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
        const parsed = contentSchema.parse(body);

        const content = new Content({
            title: parsed.title,
            authorId: user._id,
            contentType: parsed.contentType.charAt(0).toUpperCase() + parsed.contentType.slice(1),
            content: parsed.content,
            tags: parsed.tags || [],
            description: parsed.description || '',
            coverImage: parsed.coverImage,
            status: parsed.status,
            publishedAt: parsed.status === 'published' ? new Date() : undefined,
        });

        await content.save();

        return NextResponse.json({ content }, { status: 201 });
    } catch (error: any) {
        console.error("Error saving content:", error);
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to save content." }, { status: 500 });
    }
}