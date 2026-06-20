import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthOptions } from "next-auth";
import bcrypt from 'bcryptjs';

import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

export const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          await connectToDB();
          const user = await User.findOne({ email: credentials.email });

          if (!user || !user.password) {
            throw new Error('Invalid email or password');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Invalid email or password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          };
        },
      }),
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
    pages: {
      signIn: '/login',
    },
    callbacks: {
      async signIn({ user, account }) {
        await connectToDB();

        try {
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            if (account?.provider === 'credentials') {
              return true;
            }
            await User.create({
              _id: new mongoose.Types.ObjectId(),
              email: user.email,
              name: user.name,
              image: user.image,
              provider: account?.provider,
              providerAccountId: account?.providerAccountId,
            });
          } else if (account?.provider !== 'credentials' && !existingUser.provider) {
            existingUser.provider = account?.provider;
            existingUser.providerAccountId = account?.providerAccountId;
            if (user.image) existingUser.image = user.image;
            await existingUser.save();
          }
          return true;
        } catch (error) {
          console.log(error);
          return false;
        }
      },
      async session({ session, token }) {
        if (session.user) {
          (session.user as { id?: string }).id = token.sub as string;
        }
        return session;
      },
      async jwt({ token, user }) {
        if (user) {
          token.sub = user.id;
        }
        return token;
      },
    },
    session: {
      strategy: 'jwt',
    },
};

export default authOptions;