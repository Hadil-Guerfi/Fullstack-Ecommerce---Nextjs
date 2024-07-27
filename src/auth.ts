import NextAuth, { type DefaultSession } from "next-auth";
import authConfig from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import db from "@/lib/db";
import { getUserById } from "../data/user";
import { JWT } from "next-auth/jwt";
import { getTwoFactorConfirmationByUserId } from "../data/two-factor-confirmation";
import { getAccountByUserId } from "../data/account";

/*used to add attribut to default session user ( which is not same as our user schema) to match our User Schema by TS
default user is : 
export interface User {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}
*/
declare module "next-auth" {
  export interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      isTwoFactorEnabled: boolean;
      isOAuth: boolean;
    } & DefaultSession["user"];
  }
}

/*it allows you to include custom properties in the JWT to match our User Schema by TS.
more than those default attributs : 
export interface DefaultJWT extends Record<string, unknown> {
  name?: string | null
  email?: string | null
  picture?: string | null
  sub?: string
  iat?: number
  exp?: number
  jti?: string
};
*/
declare module "next-auth/jwt" {
  interface JWT {
    role?: "USER" | "ADMIN";
    id: string;
    isTwoFactorEnabled: boolean;
    isOAuth: boolean;
  }
}

//signIn , signOut , auth are used in server componenents only or in server actions
/*there is a way to use them in client compos is to import from next-auth/react not from @/auth 
  or declare server actions that impelement those methods and use those server actions inside client compos
*/
export const { handlers, auth, signIn, signOut,unstable_update } = NextAuth({
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

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOAuth = !!existingAccount;
      //when we want to pass a certain property to session through token
      //ALSO when we want an automatique update (reload) when we update certain of this attributs
      token.name = existingUser.name;
      token.email = existingUser.email;
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
      //ALSO when we want an automatique update (reload) when we update certain of this attributs get them from token
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.isOAuth = token.isOAuth;
      }
      return session;
    },

  },

  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
