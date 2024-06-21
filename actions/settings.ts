"use server";
import { z } from "zod";
import { SettingsSchema } from "../schemas";
import { currentUser } from "@/lib/auth";
import { getUserByEmail, getUserById } from "../data/user";
import db from "@/lib/db";
import { generateVerficationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import bcrypt from "bcryptjs"

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const dbUser = await getUserById(user.id);

  if (!dbUser) {
    return { error: "Unauthorized" };
  }

  if (user.isOAuth) {
    values.email = undefined;
    values.password = undefined as any;
    values.newPassword = undefined as any;
    values.isTwoFactorEnabled = undefined;
  }

  if(values.email && values.email!==user.email){
    const existingUser = await getUserByEmail(values.email);
    if (existingUser && existingUser.id !== user.id) {
      return { error: "Email already in use" };
    }
    const verificationToken = await generateVerficationToken(values.email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token as string
    );

    return { success: "Verification Email Sent!" }; 
  }

  if(values.password&&values.newPassword&&dbUser.password){
    const passwordMatch = await bcrypt.compare(values.password,dbUser.password)
    if(!passwordMatch){
      return { error: "Incorrect password!" };
    }
    const hashedPassword = await bcrypt.hash(values.newPassword, 10);
    values.password=hashedPassword
    values.newPassword=undefined

  }

  await db.user.update({
    where: { id: user.id },
    data: {
      ...values,
    },
  });

  return { success: "User updated successfully!" }; // Return success message
};
