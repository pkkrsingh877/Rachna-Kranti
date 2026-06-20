"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/sonner";
import { useContent } from '@/hooks/use-content';
import { Avatar } from '@/components/Avatar';
import LikeButton from '@/components/LikeButton';
import FollowButton from '@/components/FollowButton';
import CommentSection from '@/components/CommentSection';

export default function Page() {
    const router = useRouter();
    const params = useParams();
    const { data: session } = useSession();
    const contentId = params.id as string;

    const query = useContent(contentId);

    if (query.isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    if (query.isError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <p className="text-destructive">Error: {(query.error as Error)?.message || 'Failed to load content'}</p>
          <Button variant="outline" onClick={() => router.push('/content')}>Back to contents</Button>
        </div>
      );
    }

    const content = query.data!;

    return (
        <div className="py-10 px-4 flex flex-col items-center">
            <div className="w-full max-w-3xl bg-card rounded-xl shadow-sm border p-8">
                <div className="flex items-center gap-3 mb-6">
                  {content.authorId && (
                    <>
                      <Avatar src={content.authorId.image} name={content.authorId.name} size="md" />
                      <div>
                        <p className="font-medium">{content.authorId.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(content.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                          {content.readingTime && ` · ${content.readingTime} min read`}
                        </p>
                      </div>
                      <div className="ml-auto">
                        {session?.user?.email !== content.authorId?.email && (
                          <FollowButton authorId={content.authorId._id} />
                        )}
                      </div>
                    </>
                  )}
                </div>

                <h1 className="text-4xl font-bold mb-2">{content.title}</h1>
                <p className="text-sm text-muted-foreground italic mb-6 capitalize">{content.contentType}</p>

                {content.description && (
                  <p className="text-muted-foreground mb-6 pb-6 border-b">{content.description}</p>
                )}

                <div className="prose-content">
                  {Array.isArray(content.content) && content.content.map((stanza: any, idx: number) => (
                    <div key={idx}>
                      {stanza.type === 'stanza' && stanza.lines && (
                        <div className="mb-6">
                          {stanza.lines.map((line: string, i: number) => (
                            <p key={i} className="leading-relaxed">{line}</p>
                          ))}
                        </div>
                      )}
                      {stanza.type === 'paragraph' && stanza.text && (
                        <p className="mb-4 leading-relaxed">{stanza.text}</p>
                      )}
                      {stanza.type === 'act' && (
                        <div className="mb-8">
                          <h2 className="text-2xl font-semibold mb-4">{stanza.title}</h2>
                          {stanza.scenes?.map((scene: any, si: number) => (
                            <div key={si} className="mb-6">
                              <h3 className="text-xl font-medium mb-3">{scene.title}</h3>
                              {scene.content?.map((item: any, ci: number) => (
                                <div key={ci}>
                                  {item.type === 'paragraph' && <p className="mb-3">{item.text}</p>}
                                  {item.type === 'character' && (
                                    <div className="mb-4 ml-4">
                                      <p className="font-semibold text-primary">{item.name}</p>
                                      {item.dialogue?.map((d: any, di: number) => (
                                        <p key={di} className="ml-4 mb-1">{d.text}</p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <LikeButton contentId={contentId} />
                  <span className="text-sm text-muted-foreground">
                    {content.commentsCount ?? 0} comments
                  </span>
                </div>

                <CommentSection contentId={contentId} />

                <Button className="mt-8" variant="outline" onClick={() => router.push('/content')}>
                    ← Back to All Contents
                </Button>
            </div>
            <Toaster />
        </div>
    );
}
