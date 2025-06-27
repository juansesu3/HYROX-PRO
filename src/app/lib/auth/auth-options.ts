import type { AuthOptions } from 'next-auth';

import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/app/lib/dbConnect';
import { User } from '@/app/lib/models';
import bcrypt from 'bcryptjs';
import { JWT } from 'next-auth/jwt';

interface MyJWT extends JWT {
  id?: string;
  username?: string;
}
const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await dbConnect();
          if (!credentials) return null;

          const user = await User.findOne({ email: credentials.email }).select('+password');
          if (!user) return null;

          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordCorrect) return null;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, _id, ...rest } = user.toObject();

          return {
            id: _id.toString(), // 👈 requerido por NextAuth
            ...rest,
          };
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      const myToken = token as MyJWT;
      if (user) {
        myToken.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        myToken.username = (user as any).username;
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
        };
      }
      return session;
    }
  }
};

export default authOptions;
