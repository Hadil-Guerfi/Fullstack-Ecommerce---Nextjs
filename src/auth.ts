import NextAuth, { type DefaultSession } from "next-auth";
import authConfig from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import db from "@/lib/db";
import { getUserById } from "../data/user";
import { JWT } from "next-auth/jwt";

//used to add attribut to default session user ( its not same as our user schema)
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "USER" | "ADMIN";
  }
}

//signIn , signOut , auth are used in server componenents
//there is a way to use in client compos from next-auth/react not from @/auth initial idea !
export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  events: {
    async linkAccount({ user }) {
      //when an account in a given provider(google , github , ...) is linked to a user we verify email with current date
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },

  callbacks: {

    async signIn({user,account}){
      //Allow OAuth without email verification
      if(account?.provider!=="credentials") return true;
      
      const existingUser=await getUserById(user.id);
      
        if (!existingUser?.emailVerified)
          //Prevent sign in without email verfication
          return false;
      
      //TODO : Add 2FA check
      
      return true
    },

    async jwt({ token }) {
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;
      token.role = existingUser.role;
      return token;
    },

    async session({ token, session }) {
      console.log({ sessionToken: token });
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },

  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
