"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { GET_PRODUCT_BY_HANDLE_QUERY } from "@/graphql/products";
import { useStorefrontQuery } from "@/hooks/useStorefront";
import {
  GetProductByHandleQuery,
  ImageEdge,
  ProductOption,
  ProductPriceRange,
  ProductVariant,
} from "@/types/shopify-graphql";
import ProductCarousel from "@/components/view/ProductCarousel";
import { Skeleton } from "@/components/ui/skeleton";
import ProductPrice from "@/components/view/ProductCard/ProductPrice";
import { Button } from "@/components/ui/button";
import ProductOptions from "@/components/view/ProductOptions";
import { useCartActions } from "@/lib/atoms/cart";

const Product = () => {
  const params = useParams();
  const { addItem } = useCartActions();

  // States
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>();

  const handleSelectOptions = (options: Record<string, string>) => {
    const variant = data?.product?.variants?.edges.find((variant) => {
      return Object.keys(options).every((key) => {
        return variant.node.selectedOptions.some(
          (option) => option.name === key && option.value === options[key]
        );
      });
    });
    setSelectedVariant(variant?.node as ProductVariant);
    setSelectedOptions(options);
  };

  const { data, isLoading } = useStorefrontQuery<GetProductByHandleQuery>(
    ["product", params.handle],
    {
      query: GET_PRODUCT_BY_HANDLE_QUERY,
      variables: { handle: params.handle },
    }
  );

  if (isLoading)
    return (
      <div className="my-10 grid grid-cols-2 md:grid-cols-3 gap-4">
        <Skeleton className="h-[300px] col-span-2 w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );

  const handleAddtoCart = () => {
    if (selectedVariant) {
      addItem(selectedVariant.id, 1);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-10">
      <ProductCarousel images={data?.product?.images?.edges as ImageEdge[]} />
      <div className="flex flex-col gap-y-2">
        <h1 className="text-2xl font-bold">{data?.product?.title}</h1>
        <p className="text-sm text-gray-500">{data?.product?.description}</p>
        <ProductOptions
          selectedOptions={selectedOptions}
          setSelectedOptions={handleSelectOptions}
          options={data?.product?.options as ProductOption[]}
        />
        <ProductPrice
          priceRange={data?.product?.priceRange as ProductPriceRange}
        />
        <Button disabled={!selectedVariant} onClick={handleAddtoCart}>
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default Product;
