import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import { Content } from '@/models/Content';

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
    } catch (error: any) {
        console.error("Error fetching content:", error);
        return NextResponse.json({ error: "Failed to fetch content." }, { status: 500 });
    }
}