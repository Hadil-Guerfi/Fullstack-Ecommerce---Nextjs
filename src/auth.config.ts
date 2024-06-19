import type { NextAuthConfig } from "next-auth";
import credentials from "next-auth/providers/credentials";
import { LoginSchema } from "../schemas";
import { getUserByEmail } from "../data/user";
import bcrypt from "bcryptjs";//should be bcryptjs to work

export default {
  providers: [
    credentials({
    
      //-------------------SignIn logic --------------------
      async authorize(credentials) {

      
        const validatedFields = LoginSchema.safeParse(credentials);
        
        if (validatedFields.success) {

          const { email, password } = validatedFields.data;
          
          const user = await getUserByEmail(email);
          
          if (!user || !user.password) return null;
          
          const passwordsMatch = await bcrypt.compare(password, user.password);
          
          if (passwordsMatch) return user;

        }
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
