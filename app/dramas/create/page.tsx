"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useCreateDrama } from '@/hooks/use-dramas';

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  type: z.string().default('Drama'),
  description: z.string().max(500).optional(),
});

const dramaTypes = ['Drama', 'Play', 'Screenplay', 'Stage Script', 'TV Script'];

export default function CreateDramaPage() {
  const router = useRouter();
  const createDrama = useCreateDrama();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: 'Drama',
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createDrama.mutate(values, {
      onSuccess: (data) => {
        toast.success("Drama created!");
        router.push(`/dramas/${data.drama._id}/edit`);
      },
      onError: (error: unknown) => {
        toast.error((error as Error).message || "Failed to create drama");
      },
    });
  }

  return (
    <div className="flex justify-center items-center mt-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-3xl">
          <h1 className="text-center text-3xl font-bold">Create New Drama</h1>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Drama title" {...field} />
                </FormControl>
                <FormDescription>The name of your drama.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drama Type</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...field}
                  >
                    {dramaTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </FormControl>
                <FormDescription>What format is this drama?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Brief summary..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button type="submit" variant="outline" disabled={createDrama.isLoading}>
              {createDrama.isLoading ? "Creating..." : "Create Drama"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.push('/dramas')}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
      <Toaster />
    </div>
  );
}
