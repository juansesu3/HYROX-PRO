// src/app/lib/auth/auth-options.ts
import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/app/lib/dbConnect';
import { User } from '@/app/lib/models/User';
import bcrypt from 'bcryptjs';
import type { JWT } from 'next-auth/jwt';

interface MyJWT extends JWT {
  id?: string;
  username?: string;
  email?: string;
  category?: 'individual' | 'doubles';
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: {
          label: 'Email o nombre de usuario',
          type: 'text',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          await dbConnect();
          if (!credentials) return null;

          const { identifier, password } = credentials;
          if (!identifier || !password) return null;

          const normalizedIdentifier = identifier.toLowerCase().trim();

          const user = await User.findOne({
            $or: [
              { email: normalizedIdentifier },
              { username: normalizedIdentifier },
            ],
          }).select('+password');

          if (!user || !user.password) return null;

          const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
          );
          if (!isPasswordCorrect) return null;

          const { password: _, _id, ...rest } = user.toObject();

          return {
            id: _id.toString(),
            ...rest,
          };
        } catch (error) {
          console.error('Error en authorize:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/get-started',
  },
  callbacks: {
    async jwt({ token, user }) {
      const myToken = token as MyJWT;

      if (user) {
        myToken.id = (user as any).id;
        myToken.username = (user as any).username;
        myToken.email = (user as any).email;
        myToken.category = (user as any).category;
      }

      return myToken;
    },
    async session({ session, token }) {
      const myToken = token as MyJWT;

      if (myToken) {
        session.user = {
          ...session.user,
          id: myToken.id,
          username: myToken.username,
          email: myToken.email,
          category: myToken.category,
        } as any;
      }

      return session;
    },
  },
};
