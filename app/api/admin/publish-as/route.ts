import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import { Content } from '@/models/Content';
import { contentSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDB();
        const admin = await User.findOne({ email: session.user.email });

        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
        }

        const body = await request.json();
        const { authorId, ...contentData } = body;

        if (!authorId) {
            return NextResponse.json({ error: 'authorId is required' }, { status: 400 });
        }

        const targetAuthor = await User.findById(authorId);
        if (!targetAuthor) {
            return NextResponse.json({ error: 'Target author not found' }, { status: 404 });
        }

        const parsed = contentSchema.parse(contentData);

        const content = new Content({
            title: parsed.title,
            authorId: targetAuthor._id,
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
    } catch (error) {
        console.error("Error publishing as user:", error);
        if (error instanceof ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to publish content." }, { status: 500 });
    }
}
