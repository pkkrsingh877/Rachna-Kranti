"use client";
import React, { useState } from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';

import { useEffect } from 'react';

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }).max(200, {
        message: "Bio must be at most 200 characters.",
    }),
    username: z.string().min(8, {
        message: "Username must be at least 8 characters.",
    }).max(200, {
        message: "Bio must be at most 200 characters.",
    }),
    bio: z.string().min(20, {
        message: "Bio must be at least 20 characters.",
    }).max(200, {
        message: "Bio must be at most 200 characters.",
    }),
});

import { useQuery } from '@tanstack/react-query';

export default function Page() {
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            username: "",
            bio: "",
        },
    });

    const query = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await fetch('/api/profile', {
                method: 'GET',
                cache: 'no-store',
            });
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        },
    });

    useEffect(() => {
        // Once data is available, set the form's default values
        if (query.data) {
            form.reset({
                name: query.data.name || "",
                username: query.data.username || "",
                bio: query.data.bio || "",
            });
        }
    }, [query.data, form]);

    if (query.isLoading) return <p>Loading...</p>;
    if (query.isError) return <p>Error: Something went wrong!</p>;

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try{
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });
            if (!res.ok) {
                throw new Error('Failed to update profile');
            }

            const data = await res.json();
            console.log(data);
            router.push('/profile');
        }catch(error){
            toast("Failed to update profile");
        }
    }

    return (
        <div className="min-w-screen flex justify-center items-center mt-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <h1 className='text-center text-3xl font-bold'>Update Profile</h1>

                    {/* Name Field */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Name" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is the name of the user.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Bio Field */}
                    <FormField control={form.control} name="bio" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Bio" {...field} />
                            </FormControl>
                            <FormDescription>This is the bio of the user.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* Username Field */}
                    <FormField control={form.control} name="username" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Username" {...field} />
                            </FormControl>
                            <FormDescription>This is the username of the user.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* Submit Button */}
                    <Button
                        variant="outline"
                        onClick={() =>
                            toast("Profile updated", {
                                description: "Your Profile has been updated successfully.",
                            })
                        }
                    >
                        Submit
                    </Button>
                </form>
            </Form>
            <Toaster />
        </div>
    )
}
