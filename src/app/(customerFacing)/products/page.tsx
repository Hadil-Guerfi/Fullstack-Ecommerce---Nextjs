import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";
import { cache } from "@/lib/cache";
import db from "@/lib/db";
import React, { Suspense } from "react";

const getProducts = cache(
  async () => {
    return await db.product.findMany({
      where: {
        isAvailableForPurchase: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  },
  ["/products", "getProducts"],
  { revalidate: 60 * 60 * 24 }
);


function ProductsPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Suspense
        fallback={
          <>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </>
        }>
        <ProductSuspense />
      </Suspense>
    </div>
  );
}

export default ProductsPage;

async function ProductSuspense() {
  const products = await getProducts();
  return products.map((product) => (
    <ProductCard key={product.id} {...product} />
  ));
}
