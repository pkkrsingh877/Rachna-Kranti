import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import { Content } from '@/models/Content';
import Comment from '@/models/Comment';
import Like from '@/models/Like';
import Notification from '@/models/Notification';
export async function GET(request: Request, { params }: { params: { id: string } }) {
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

        const param = await params;
        const contentId = param.id;
        const content = await Content.findById(contentId).populate('authorId', 'name email image');

        if (!content) {
            return NextResponse.json({ error: 'Content not found' }, { status: 404 });
        }

        return NextResponse.json({ content }, { status: 200 });
    } catch (error) {
        console.error("Error fetching content:", error);
        return NextResponse.json({ error: "Failed to fetch content." }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

        const param = await params;
        const contentId = param.id;
        const content = await Content.findById(contentId);

        if (!content) {
            return NextResponse.json({ error: 'Content not found' }, { status: 404 });
        }

        if (content.authorId.toString() !== user._id.toString() && user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const allowedFields = ['title', 'content', 'tags', 'description', 'excerpt', 'coverImage', 'status'];
        const updates: Record<string, unknown> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (updates.status === 'published' && content.status !== 'published') {
            updates.publishedAt = new Date();
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const updated = await Content.findByIdAndUpdate(contentId, { $set: updates }, { new: true }).populate('authorId', 'name email image');

        return NextResponse.json({ content: updated }, { status: 200 });
    } catch (error) {
        console.error("Error updating content:", error);
        return NextResponse.json({ error: "Failed to update content." }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

        const param = await params;
        const contentId = param.id;
        const content = await Content.findById(contentId);

        if (!content) {
            return NextResponse.json({ error: 'Content not found' }, { status: 404 });
        }

        if (content.authorId.toString() !== user._id.toString() && user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await Content.findByIdAndDelete(contentId);

        await Promise.all([
            Comment.deleteMany({ contentId }),
            Like.deleteMany({ contentId }),
            Notification.deleteMany({ contentId }),
        ]);

        return NextResponse.json({ message: 'Content deleted' }, { status: 200 });
    } catch (error) {
        console.error("Error deleting content:", error);
        return NextResponse.json({ error: "Failed to delete content." }, { status: 500 });
    }
}
