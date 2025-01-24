import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStorefrontMutation } from "@/lib/hooks/useStorefront";
import { CUSTOMER_ACCESS_TOKEN_CREATE } from "@/graphql/auth";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { setCookie } from "nookies";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  setShowRegister: (show: boolean) => void;
};

const Login = ({ setShowRegister }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useStorefrontMutation();
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const response = (await mutate({
        query: CUSTOMER_ACCESS_TOKEN_CREATE,
        variables: {
          input: {
            email: values.email,
            password: values.password,
          },
        },
      })) as {
        customerAccessTokenCreate: {
          customerUserErrors: { message: string }[];
          customerAccessToken: { accessToken: string };
        };
      };

      if (response.customerAccessTokenCreate.customerUserErrors.length > 0) {
        throw new Error(
          response.customerAccessTokenCreate.customerUserErrors[0].message
        );
      }

      // Customer Access Token
      setCookie(
        null,
        "customerAccessToken",
        response.customerAccessTokenCreate.customerAccessToken.accessToken,
        {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        }
      );

      toast.success("You have been logged in successfully.");
      router.push("/account");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to login");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              form.handleSubmit(onSubmit)(e);
            }
          }}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between">
            <Button
              variant="link"
              onClick={() => setShowRegister(true)}
              className="text-sm"
            >
              Don&apos;t have an account? <b>Register</b>
            </Button>
            <Button type="submit" className="w-1/2" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Login;
