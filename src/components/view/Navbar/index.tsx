"use client";

import React, { useEffect } from "react";
import Logo from "../Logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartActions } from "@/lib/atoms/cart";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const router = useRouter();

  const { cart, initializeCart } = useCartActions();

  useEffect(() => {
    if (!cart?.checkoutUrl) {
      initializeCart();
    }
  }, [cart, initializeCart]);

  return (
    <div className="flex items-center justify-between">
      <Logo />
      <div className="flex items-center gap-x-4">
        <Link
          className="text-sm font-medium transition-all hover:underline"
          href="/collections/men"
        >
          Men
        </Link>
        <Link
          className="text-sm font-medium transition-all hover:underline"
          href="/collections/women"
        >
          Women
        </Link>
      </div>
      <div className="flex items-center gap-x-2">
        <div className="relative">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => router.push(cart?.checkoutUrl || "/")}
          >
            <ShoppingCart />
          </Button>
          {cart?.lines.edges.length > 0 && (
            <Badge variant="default" className="absolute -top-2 right-0">
              {cart.lines.edges.length}
            </Badge>
          )}
        </div>
        <Button onClick={() => router.push("/auth")} size="sm">
          Login
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
