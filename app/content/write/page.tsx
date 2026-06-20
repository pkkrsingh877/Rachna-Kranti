"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Editor } from '@tiptap/react';
import SimpleEditor from '@/components/SimpleEditor';
import { useCreateContent, useUpdateContent, useContent } from '@/hooks/use-content';

const formSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    contentType: z.enum(['poem', 'story', 'prose', 'drama']),
    description: z.string().max(500).optional(),
});

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');

    const [editorRef, setEditorRef] = useState<Editor | null>(null);
    const [initialContent, setInitialContent] = useState<Record<string, unknown> | undefined>(undefined);

    const createContent = useCreateContent();
    const updateContent = useUpdateContent();
    const existingQuery = useContent(editId || '');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            contentType: 'poem',
            description: "",
        },
    });

    useEffect(() => {
        if (existingQuery.data) {
            form.reset({
                title: existingQuery.data.title,
                contentType: (existingQuery.data.contentType?.toLowerCase() || 'poem') as 'poem' | 'story' | 'prose' | 'drama',
                description: existingQuery.data.description || '',
            });
            setInitialContent(existingQuery.data.content as Record<string, unknown>);
        }
    }, [existingQuery.data, form]);

    if (editId && existingQuery.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!editorRef) {
            toast.error("Editor not ready");
            return;
        }

        const editorJSON = editorRef.getJSON();
        const payload = {
            title: values.title,
            contentType: values.contentType,
            content: editorJSON,
            description: values.description,
            status: 'published' as const,
        };

        if (editId) {
            updateContent.mutate(
                { id: editId, data: payload },
                {
                    onSuccess: () => {
                        toast.success("Content updated!");
                        router.push(`/content/${editId}`);
                    },
                    onError: (error: unknown) => {
                        toast.error((error as Error).message || "Failed to update content");
                    },
                }
            );
        } else {
            createContent.mutate(
                payload,
                {
                    onSuccess: (data) => {
                        toast.success("Content saved!");
                        router.push(`/content/${data.content._id}`);
                    },
                    onError: (error: unknown) => {
                        toast.error((error as Error).message || "Failed to save content");
                    },
                }
            );
        }
    }

    return (
        <div className="min-w-screen flex justify-center items-center mt-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-3xl">
                    <h1 className='text-center text-3xl font-bold'>
                        {editId ? 'Edit Content' : 'Write New Content'}
                    </h1>

                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Title" {...field} />
                                </FormControl>
                                <FormDescription>This is the name of the content.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="contentType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Content Type</FormLabel>
                                <FormControl>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        {...field}
                                        disabled={!!editId}
                                    >
                                        <option value="poem">Poem</option>
                                        <option value="story">Story</option>
                                        <option value="prose">Prose</option>
                                        <option value="drama">Drama</option>
                                    </select>
                                </FormControl>
                                <FormDescription>Select the type of content.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                            <div className="border rounded p-2 min-h-[200px]">
                                <SimpleEditor onEditorReady={setEditorRef} defaultContent={initialContent} />
                            </div>
                        </FormControl>
                        <FormDescription>Write your content using the editor above.</FormDescription>
                        <FormMessage />
                    </FormItem>

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Short Description (optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Brief summary of your content..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-4">
                        <Button type="submit" variant="outline" disabled={createContent.isLoading || updateContent.isLoading}>
                            {createContent.isLoading || updateContent.isLoading
                                ? "Saving..."
                                : editId
                                    ? "Update"
                                    : "Submit"
                            }
                        </Button>
                        {editId && (
                            <Button type="button" variant="ghost" onClick={() => router.push(`/content/${editId}`)}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
            <Toaster />
        </div>
    )
}
