"use client";

import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/view/ProductCard";
import { GET_COLLECTION_BY_HANDLE_WITH_PAGINATION_QUERY } from "@/graphql/collections";
import { useStorefrontQuery } from "@/hooks/useStorefront";
import { GetCollectionByHandleQuery, Product } from "@/types/shopify-graphql";
import { useParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";

const CollectionPage = () => {
  const unwrappedParams = useParams();

  //   Pagination
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [previousCursors, setPreviousCursors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useStorefrontQuery<GetCollectionByHandleQuery>(
    ["collections", currentCursor],
    {
      query: GET_COLLECTION_BY_HANDLE_WITH_PAGINATION_QUERY,
      variables: {
        handle: unwrappedParams.handle,
        first: 12,
        after: currentCursor,
      },
    }
  );

  const handleNextPage = () => {
    if (currentCursor) {
      setPreviousCursors([...previousCursors, currentCursor]);
    }
    setCurrentCursor(data?.collection?.products?.pageInfo?.endCursor ?? null);
    setCurrentPage(currentPage + 1);
  };
  const handlePreviousPage = () => {
    const previousCursor = previousCursors[previousCursors.length - 1];
    const newPreviousCursors = previousCursors.slice(0, -1);
    setPreviousCursors(newPreviousCursors);
    setCurrentCursor(previousCursor);
    setCurrentPage(currentPage - 1);
  };

  if (isLoading) {
    return (
      <div className="my-10 flex flex-col gap-y-6">
        <Skeleton className="h-[50px] w-full" />
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-[300px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-10 flex flex-col gap-y-6">
      <h1 className="text-2xl font-bold">{data?.collection?.title}</h1>
      <div className="grid grid-cols-3 gap-6">
        {data?.collection?.products?.edges?.map((product) => (
          <ProductCard
            key={product?.node?.id}
            product={product.node as Product}
          />
        ))}
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={handlePreviousPage}
              className={
                !data?.collection?.products?.pageInfo?.hasPreviousPage
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={handleNextPage}
              className={
                !data?.collection?.products?.pageInfo?.hasNextPage
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default CollectionPage;
