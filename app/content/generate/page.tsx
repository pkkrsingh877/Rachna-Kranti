"use client";
import React from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from 'next/navigation';
import { useGenerateContent } from '@/hooks/use-content';

const formSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    prompt: z.string().min(20, "Prompt must be at least 20 characters."),
    type: z.enum(["poem", "prose", "story", "drama"], {
        errorMap: () => ({ message: "Please select a type." }),
    }),
});

export default function Page() {
    const router = useRouter();
    const generateContent = useGenerateContent();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            prompt: "",
            type: "poem",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        generateContent.mutate(values, {
            onSuccess: () => {
                toast.success("Content generated!");
                router.push('/content');
            },
            onError: (error: unknown) => {
                toast.error((error as Error).message || "Failed to generate content");
            },
        });
    }

    return (
        <div className="min-w-screen flex justify-center items-center mt-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <h1 className='text-center text-3xl font-bold'>Generate Content Using AI</h1>

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
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <FormControl>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        {...field}
                                    >
                                        <option value="poem">Poem</option>
                                        <option value="prose">Prose</option>
                                        <option value="story">Story</option>
                                        <option value="drama">Drama</option>
                                    </select>
                                </FormControl>
                                <FormDescription>Select the type of content to generate.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField control={form.control} name="prompt" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prompt</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Write prompt/theme..." {...field} />
                            </FormControl>
                            <FormDescription>Describe what you want the AI to generate.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <Button type="submit" variant="outline" disabled={generateContent.isLoading}>
                        {generateContent.isLoading ? "Generating..." : "Generate"}
                    </Button>
                </form>
            </Form>
            <Toaster />
        </div>
    )
}
