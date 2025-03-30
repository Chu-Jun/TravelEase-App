'use client';

import { signUpAction } from '@/app/actions';

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast"
import { createElement, useState } from "react";

import Link from "next/link";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const formSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3, {
        message: "Username must be at least 3 characters."
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters."
    })
})

export default function Signup() {

  const [passwordVisibility, setPasswordVisibility] = useState(false);

  const { toast } = useToast()

  interface FormValues {
    email: string;
    username: string;
    password: string;
  }

  const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {  
        email: "",
        username: "",
        password: "",
      },
  })

  async function onSubmit(values: FormValues) {
    const result = await signUpAction(values, "user");
    
    const status = result.status;
    const message = result.message;

    toast({
        variant: status === "error" ? "destructive" : "default",
        title: status === "error" ? "Error" : "Success",
        description: message || "Something went wrong",
    });

    }

  return (
    <div className="min-h-screen px-8 mb-8 lg:px-16 lg:py-8 text-primary mt-28 md:mt-0 lg:mt-0 ">
        <Card className="m-auto w-full bg-white md:w-3/4 lg:w-1/3">
            <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Sign up to access more features!</CardDescription>
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
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your Name" {...field} />
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
                                <span>Signing up...</span>
                            ) : (
                                <span>Sign up</span>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-between text-sm font-semibold text-wrap">
                <Link href="/sign-in" className="w-1/2">Already have an account?</Link>
            </CardFooter>
        </Card>
    </div>
  );
}
