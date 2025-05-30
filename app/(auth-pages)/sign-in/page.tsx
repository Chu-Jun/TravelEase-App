'use client'

import { signInAction } from "@/app/actions";
import { useCallback } from "react";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Box } from "@/components/ui/box"
import { Separator } from "@/components/ui/separator"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import Link from "next/link";
import { useAuth } from "@/context/AuthContext"
import { createElement, useEffect, useState } from "react"

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters."
    })
})


export default function Login() {

  const [passwordVisibility, setPasswordVisibility] = useState(false);

  const { toast } = useToast()

  const { isAuth } = useAuth();
  const { updateAuthStatus } = useAuth();

  const router = useRouter();

  interface FormValues {
    email: string;
    password: string;
  }

  const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {  
        email: "",
        password: "",
      },
  })

  const navigateToHome = useCallback(() => {
    router.push("/");
  }, [router]);
  
  useEffect(() => {
    console.log(isAuth);
    if (isAuth) {
      navigateToHome();
    }
  }, [isAuth, navigateToHome]);

  async function onSubmit(values: FormValues) {

    const result = await signInAction(values);
    
    const status = result.status;
    const message = result.message;

    if (status === "success") {
        updateAuthStatus(true, "user"); // Ensure authentication state updates
        router.push("/"); // Redirect to home page
      }

    toast({
        variant: status === "error" ? "destructive" : "default",
        title: status === "error" ? "Error" : "Success",
        description: message || "Something went wrong",
    });

  }

  return (
    <div className="min-h-screen px-8 mb-8 lg:px-16 lg:py-8 text-primary mt-28 md:mt-0 lg:mt-0 ">
        <Card className="m-auto bg-white w-full md:w-3/4 lg:w-1/3">
            <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Login to your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="x.@gmail.com" {...field} />
                                </FormControl>
                                <FormMessage/>
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
                                    <Box className="relative">
                                        <Input
                                            {...field}
                                            type={passwordVisibility ? "text" : "password"}
                                            autoComplete="on"
                                            placeholder=""
                                        />
                                        <Box
                                            className="absolute inset-y-0 right-0 flex cursor-pointer items-center p-3 text-muted-foreground"
                                            onClick={() => setPasswordVisibility(!passwordVisibility)}
                                        >
                                            {createElement(passwordVisibility ? EyeOffIcon : EyeIcon , {
                                            className: "h-6 w-6",
                                            })}
                                        </Box>
                                    </Box>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                        />
                        <Button type="submit" className="bg-secondary text-white mt-8" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? (
                                <span>Signing in...</span>
                            ) : (
                                <span>Sign in</span>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-between text-sm font-semibold text-wrap">
                <div className="flex h-4 items-center space-x-2 md:space-x-3">
                    <Link href="/sign-up" className="w-1/2 text-left text-xs md:text-sm">Didn&apos;t have an account?</Link>
                    <Separator orientation="vertical" />
                    <Link href="/forgot-password" className="w-1/2 text-right text-xs md:text-sm">Forgot Your Password?</Link>
                </div>
            </CardFooter>
        </Card>
    </div>
  );
}
