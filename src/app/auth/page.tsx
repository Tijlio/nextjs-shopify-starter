"use client";

import { Button } from "@/components/ui/button";
import SignUp from "@/components/view/Auth/Signup";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import React, { useEffect, useState } from "react";

const Auth = () => {
  const router = useRouter();
  const [showRegister, setShowRegister] = useState(false);
  const cookies = parseCookies();
  const customerAccessToken = cookies.customerAccessToken;

  useEffect(() => {
    if (customerAccessToken) {
      router.push("/");
    }
  }, [customerAccessToken, router]);

  return (
    <div className="mx-auto max-w-md">
      <Button onClick={() => setShowRegister(!showRegister)}>
        {showRegister ? <SignUp /> : <LogIn />}
      </Button>
    </div>
  );
};

export default Auth;
