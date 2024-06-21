"use client";

import React, { useState, useTransition } from "react";
import CardWrapper from "./card-wrapper";
import { useForm } from "react-hook-form";
import { LoginSchema } from "../../../schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import FormError from "../ui/form-error";
import FormSuccess from "../ui/form-success";
import { login } from "../../../actions/login";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

function LoginForm() {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [showTwoFactor, setShowTwoFactor] = useState<boolean>(false);

  const searchParams = useSearchParams();
  //url in this form : http://localhost:3000/auth/login?error=OAuthAccountNotLinked
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with different provider!"
      : "";

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { update } = useSession();

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");



    startTransition(() => {
      login(values).then((data) => {
        if (data?.error) {
          form.reset();
          setError(data?.error);
        }


        if (data?.success) {
          form.reset();
          setSuccess(data?.success);
          update();

        }
        if(data?.twoFactor){
          setShowTwoFactor(true)
        }
      }).catch(()=>{
        setError("Something went wrong!")
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Login"
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/register"
      showSocial>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {showTwoFactor && (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two Factor Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123456" />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            {!showTwoFactor && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="john.doe@example.com"
                          type="email"
                        />
                      </FormControl>
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
                        <Input
                          placeholder="******"
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <Button
                        size="sm"
                        variant="link"
                        asChild
                        className="px-0 font-normal">
                        <Link href="/auth/reset">Forgot password?</Link>
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          <FormError message={error || urlError} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            {showTwoFactor
              ? isPending
                ? "Confirming ..."
                : "Confirm"
              : isPending
              ? "Logging in ..."
              : "Login"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}

export default LoginForm;
