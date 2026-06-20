"use client";
import React, { useEffect } from 'react';
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
import { useProfile, useUpdateProfile } from '@/hooks/use-profile';

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters.").max(200),
    username: z.string().min(3, "Username must be at least 3 characters.").max(200),
    bio: z.string().min(10, "Bio must be at least 10 characters.").max(500, "Bio must be at most 500 characters."),
});

export default function Page() {
    const router = useRouter();
    const profileQuery = useProfile();
    const updateProfile = useUpdateProfile();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", username: "", bio: "" },
    });

    useEffect(() => {
        if (profileQuery.data) {
            form.reset({
                name: profileQuery.data.name || "",
                username: profileQuery.data.username || "",
                bio: profileQuery.data.bio || "",
            });
        }
    }, [profileQuery.data, form]);

    if (profileQuery.isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    if (profileQuery.isError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <p className="text-destructive">Error: {(profileQuery.error as Error)?.message || 'Failed to load profile'}</p>
        </div>
      );
    }

    function onSubmit(values: z.infer<typeof formSchema>) {
        updateProfile.mutate(values, {
            onSuccess: () => {
                toast.success("Profile updated!");
                router.push('/profile');
            },
            onError: (error: unknown) => {
                toast.error((error as Error).message || "Failed to update profile");
            },
        });
    }

    return (
        <div className="min-w-screen flex justify-center items-center mt-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <h1 className='text-center text-3xl font-bold'>Update Profile</h1>

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Name" {...field} />
                                </FormControl>
                                <FormDescription>This is the name of the user.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

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

                    <Button type="submit" variant="outline" disabled={updateProfile.isLoading}>
                        {updateProfile.isLoading ? "Saving..." : "Submit"}
                    </Button>
                </form>
            </Form>
            <Toaster />
        </div>
    )
}
