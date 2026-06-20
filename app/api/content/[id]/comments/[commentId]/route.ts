import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import Comment from '@/models/Comment';
import { Content } from '@/models/Content';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { commentId } = await params;
    await connectToDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.authorId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Not authorized to delete this comment' }, { status: 403 });
    }

    await Comment.findByIdAndDelete(commentId);
    await Content.findByIdAndUpdate(comment.contentId, { $inc: { commentsCount: -1 } });

    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('DELETE comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
