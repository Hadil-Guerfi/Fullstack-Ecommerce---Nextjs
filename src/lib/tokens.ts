import { v4 as uuidv4 } from "uuid";
import { getVerificationTokenByEmail } from "../../data/verification-token";
import db from "./db";


//---------------- to generate email_verified for user when just using credentials  ---------------


export const generateVerficationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);
  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await db.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const verificationToken = await db.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });
  return verificationToken;
};
