"use client";

import { ProductPriceRange } from "@/types/shopify-graphql";
import React from "react";

const ProductPrice = ({ priceRange }: { priceRange: ProductPriceRange }) => {
  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol",
    }).format(parseFloat(amount));
  };

  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex items-center gap-2 font-semibold">
        <p suppressHydrationWarning className="text-lg">
          {formatPrice(
            priceRange.minVariantPrice.amount,
            priceRange.minVariantPrice.currencyCode
          )}
        </p>

        {priceRange.maxVariantPrice.amount !==
          priceRange.minVariantPrice.amount && (
          <p suppressHydrationWarning className="text-lg text-gray-600">
            -{" "}
            {formatPrice(
              priceRange.maxVariantPrice.amount,
              priceRange.maxVariantPrice.currencyCode
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductPrice;
