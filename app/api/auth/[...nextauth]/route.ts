import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from "next-auth";

import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import { getProviders } from 'next-auth/react';
import mongoose, { mongo } from 'mongoose';

export const authOptions: NextAuthOptions = {
    providers: [
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID ?? "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    debug: true,
    callbacks: {
      async signIn({ user, account}) {
        await connectToDB();

        try {
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            await User.create({
              _id: new mongoose.Types.ObjectId(),
              email: user.email,
              name: user.name,
              image: user.image,
              provider: account?.provider,
              providerAccountId: account?.providerAccountId,
            });
          }
          return true;
        }catch(error){
          console.log(error);
          return false;
        }
      }
    }
};

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };