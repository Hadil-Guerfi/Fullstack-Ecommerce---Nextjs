import db from "@/lib/db";
import { notFound, useSearchParams } from "next/navigation";
import React from "react";
import Stripe from "stripe";
import { CheckoutForm } from "./_components/CheckoutForm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function PurchasePage({ params: { id } }: { params: { id: string } }) {
  const product = await db.product.findUnique({ where: { id } });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: product?.priceInCents as number,
    currency: "USD",
    metadata: { productId: product?.id as string },
  });

  if (paymentIntent.client_secret === null) {
    throw Error("Stripe failed to create payment intent");
  }
  if (product === null) {
    return notFound();
  }

  return <CheckoutForm product={product} clientSecret={paymentIntent.client_secret}/>;
}

export default PurchasePage;
