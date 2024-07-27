"use server";

import { z } from "zod";
import { LoginSchema } from "../schemas";
import { signIn } from "@/auth"; // destucted in auth.ts
import { AuthError } from "next-auth";
import { getUserByEmail } from "../data/user";
import { generateTwoFactorToken, generateVerficationToken } from "@/lib/tokens";
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "@/lib/mail";
import { getTwoFactorTokenByEmail } from "../data/two-factor-token";
import db from "@/lib/db";
import { getTwoFactorConfirmationByUserId } from "../data/two-factor-confirmation";
import { UserRole } from "@prisma/client";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fileds!" };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);


  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email deos not exist!" };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerficationToken(
      existingUser.email
    );
    await sendVerificationEmail(
      verificationToken.email as string,
      verificationToken.token as string
    );

    return { success: "Confirmation email sent! " };
  }

  if (existingUser.email && existingUser.isTwoFactorEnabled) {
    if (code) {
      //TODO verify code
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);
      if (!twoFactorToken) {
        return {
          error: "Invalid code!",
        };
      }
      if (twoFactorToken.token !== code) {
        return {
          error: "Invalid code!",
        };
      }
      const hasExpired = new Date(twoFactorToken.expires as Date) < new Date();

      if (hasExpired) {
        return {
          error: "Code has expired!",
        };
      }
      await db.twoFactorToken.delete({
        where: {
          id: twoFactorToken.id,
        },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      );

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(
        twoFactorToken.email,
        twoFactorToken.token as string
      );
      return { twoFactor: true };
    }
  }


  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo:existingUser.role === UserRole.ADMIN ? "/admin" : "/",
      redirect:true
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
