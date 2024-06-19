"use server";

import { z } from "zod";
import { LoginSchema } from "../schemas";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { signIn } from "@/auth"; // destucted in auth.ts
import { AuthError } from "next-auth";
import { getUserByEmail } from "../data/user";
import { generateVerficationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fileds!" };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await getUserByEmail(email);
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email deos not exist!" };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerficationToken(
      existingUser.email
    );
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return { success: "Confirmation email sent! " };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    throw error; //we should throw error like this to make redirectTo working fine
  }
};
