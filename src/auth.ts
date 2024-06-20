import NextAuth, { type DefaultSession } from "next-auth";
import authConfig from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import db from "@/lib/db";
import { getUserById } from "../data/user";
import { JWT } from "next-auth/jwt";
import { getTwoFactorConfirmationByUserId } from "../data/two-factor-confirmation";

//used to add attribut to default session user ( its not same as our user schema)
declare module "next-auth" {
  export interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      isTwoFactorEnabled: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "USER" | "ADMIN";
  }
}

//signIn , signOut , auth are used in server componenents only or in server actions
/*there is a way to use them in client compos is to import from next-auth/react not from @/auth 
  or declare server actions that impelement those methods and use those server actions inside client compos
*/
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
    //singin executed always what ever sign in method is
    async signIn({ user, account }) {
      //Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id as string);

      //Prevent sign in without email verfication
      if (!existingUser?.emailVerified) return false;

      //TODO : Add 2FA check
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        );
        if (!twoFactorConfirmation) return false;
        await db.twoFactorConfirmation.delete({
          where: {
            id: twoFactorConfirmation.id,
          },
        });
      }
      return true;
    },

    async jwt({ token }) {
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;

      return token;
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role;
      }
       if (token.isTwoFactorEnabled && session.user) {
         session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
       }
      return session;
    },
  },

  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
