"use client";

import React from "react";
import Logo from "../Logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

const Navbar = () => {
  return (
    <div className="flex items-center justify-between">
      <Logo />
      <div className="flex items-center gap-x-4">
        <Link
          className="text-sm font-medium transition-all hover:underline"
          href="/men"
        >
          Men
        </Link>
        <Link
          className="text-sm font-medium transition-all hover:underline"
          href="/women"
        >
          Women
        </Link>
      </div>
      <div className="flex items-center gap-x-2">
        <Button size="icon" variant="ghost">
          <ShoppingBag />
        </Button>
        <Button size="sm">Login</Button>
      </div>
    </div>
  );
};

export default Navbar;
