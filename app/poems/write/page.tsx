"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateContent } from '@/hooks/use-content';

const formSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    content: z.string().min(20, "Content must be at least 20 characters."),
});

export default function Page() {
    const router = useRouter();
    const createContent = useCreateContent();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            content: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        createContent.mutate(
            {
                title: values.title,
                contentType: 'poem',
                content: { text: values.content },
                description: values.content.slice(0, 280),
                status: 'published',
            },
            {
                onSuccess: (data) => {
                    toast.success("Poem published!");
                    router.push(`/content/${data.content._id}`);
                },
                onError: (error: unknown) => {
                    toast.error((error as Error).message || "Failed to save poem");
                },
            }
        );
    }

    return (
        <div className="min-w-screen flex justify-center items-center mt-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <h1 className='text-center text-3xl font-bold'>Compose Poem</h1>

                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Title" {...field} />
                                </FormControl>
                                <FormDescription>This is the name of the poem.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField control={form.control} name="content" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Write your poem here..." {...field} />
                            </FormControl>
                            <FormDescription>This is the content of the poem.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <Button type="submit" variant="outline" disabled={createContent.isLoading}>
                        {createContent.isLoading ? "Publishing..." : "Submit"}
                    </Button>
                </form>
            </Form>
            <Toaster />
        </div>
    )
}
