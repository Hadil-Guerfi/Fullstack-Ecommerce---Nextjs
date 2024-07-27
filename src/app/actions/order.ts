"use server";
import OrderHistoryEmail from "@/email/OrderHistory";
import db from "@/lib/db";
import React from "react";
import { Resend } from "resend";
import { z } from "zod";

export const userOrderExists = async (email: string, productId: string) => {
  const order = await db.order.findFirst({
    where: {
      user: {
        email: email,
      },
      product: {
        id: productId,
      },
    },
    select: {
      id: true,
    },
  });

  return order !== null;
};

const emailSchema = z.string().email();
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function emailOrderHistory(
  prevState: unknown,
  formData: FormData
): Promise<{ message?: string; error?: string }> {
  const result = emailSchema.safeParse(formData.get("email"));

  if (result.success === false) {
    return { error: "Invalid email address" };
  }

  const user = await db.user.findUnique({
    where: { email: result.data },
    select: {
      email: true,
      orders: {
        select: {
          pricePaidInCents: true,
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              imagePath: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (user == null) {
    return {
      message:
        "Check your email to view your order history and download your products.",
    };
  }

  const orders = await Promise.all(
    user.orders.map(async (order) => {
      const downloadVerification = await db.downloadVerification.create({
        data: {
          expiresAt: new Date(Date.now() + 24 * 1000 * 60 * 60),
          productId: order.product.id,
        },
      });

      return {
        ...order,
        downloadVerificationId: downloadVerification.id,
      };
    })
  );

  const emailData = {
    from: "onboarding@resend.dev",
    to: user.email as string,
    subject: "Order History",
    react: React.createElement(OrderHistoryEmail, {
      orders,
    }),
  };

  const data = await resend.emails.send(emailData);

  if (data.error) {
    return {
      error: "There was an error sending your email. Please try again.",
    };
  }

  return {
    message:
      "Check your email to view your order history and download your products.",
  };
}
