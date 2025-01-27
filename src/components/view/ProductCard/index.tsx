"use client";

import { Button } from "@/components/ui/button";
import { Product } from "@/types/shopify-graphql";
import React from "react";
import Image from "next/image";
import ProductPrice from "./ProductPrice";
import { useRouter } from "next/navigation";

const ProductCard = ({ product }: { product: Product }) => {
  const router = useRouter();
  return (
    <div
      role="button"
      className="flex flex-col gap-2"
      onClick={() => router.push(`/product/${product.handle}`)}
    >
      <div className="relative w-full h-[300px] rounded-lg overflow-hidden border border-gray-100">
        <Image
          src={product.featuredImage?.url ?? null}
          alt={product.featuredImage?.altText ?? ""}
          layout="fill"
          className="w-full h-full object-cover"
        />
      </div>
      <h1>{product.title}</h1>
      <ProductPrice priceRange={product.priceRange} />
      <Button>Add to Cart</Button>
    </div>
  );
};

export default ProductCard;
