"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SimpleEditor from '@/components/SimpleEditor';
import { useCreateContent } from '@/hooks/use-content';

const formSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    contentType: z.enum(['poem', 'story', 'prose', 'drama']),
    description: z.string().max(500).optional(),
});

export default function Page() {
    const router = useRouter();
    const [editorRef, setEditorRef] = useState<any>(null);
    const createContent = useCreateContent();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            contentType: 'poem',
            description: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!editorRef) {
            toast.error("Editor not ready");
            return;
        }

        const editorJSON = editorRef.getJSON();
        createContent.mutate(
            {
                title: values.title,
                contentType: values.contentType,
                content: editorJSON,
                description: values.description,
                status: 'published',
            },
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

    return (
        <div className="min-w-screen flex justify-center items-center mt-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-3xl">
                    <h1 className='text-center text-3xl font-bold'>Write New Content</h1>

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
                                <SimpleEditor onEditorReady={setEditorRef} />
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

                    <Button type="submit" variant="outline" disabled={createContent.isLoading}>
                        {createContent.isLoading ? "Saving..." : "Submit"}
                    </Button>
                </form>
            </Form>
            <Toaster />
        </div>
    )
}
