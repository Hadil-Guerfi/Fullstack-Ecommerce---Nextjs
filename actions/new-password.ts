"use server";
import db from "@/lib/db";
import { getPasswordResetTokenByToken } from "../data/password-reset-token";
import { getUserByEmail } from "../data/user";
import { NewPasswordSchema } from "../schemas";
import { z } from "zod";
import * as bcrypt from "bcrypt";

export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token: string |null
) => {


  const validatedFields=NewPasswordSchema.safeParse(values)

  if(!validatedFields.success){
    return { error: "Invalid fields!" };
  }

  const {password}=validatedFields.data
  
  const existingToken = await getPasswordResetTokenByToken(token as string);
  if (!existingToken) {
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires as Date) < new Date();
  if (hasExpired) {
    return { error: "Token has expired!" };
  }
  const existingUser = await getUserByEmail(existingToken.email as string);
  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  const hashedPassword=await bcrypt.hash(password,10)

  await db.user.update({
    where: { id: existingUser.id },
    data: {
      password: hashedPassword,
    },
  });
  await db.passwordResetToken.delete({
    where: { id: existingToken.id },
  });
  return { success: "Password Reset !" };
};
