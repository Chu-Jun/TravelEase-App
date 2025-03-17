"use client"
import { resetPasswordAction } from "@/app/actions";
import { Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Box } from "@/components/ui/box"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createElement, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "lucide-react"

const formSchema = z.object({
  password: z.string().min(8, {
      message: "Password must be at least 8 characters."
  }),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters."
})
})

export default function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {

  const [passwordVisibility, setPasswordVisibility] = useState(false);

  const router = useRouter();

  const { toast } = useToast()

  interface FormValues {
    password: string;
    confirmPassword: string;
  }

  const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {  
        password: "",
        confirmPassword: "",
      },
  })

  async function onSubmit(values: FormValues) {

    const result = await resetPasswordAction(values);
    
    const status = result.status;
    const message = result.message;

    if (status === "success") {
        router.push("/sign-in"); // Redirect to sign-in page
      }

    toast({
        variant: status === "error" ? "destructive" : "default",
        title: status === "error" ? "Error" : "Success",
        description: message || "Something went wrong",
    });

  }

  return (
    <div className="min-h-screen px-8 mb-8 lg:px-16 lg:py-8 text-primary">
    <Card className="m-auto bg-white w-full md:w-3/4 lg:w-1/3">
        <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Reset your account password.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
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
                                <span>Updating...</span>
                            ) : (
                                <span>Update Password</span>
                            )}
                        </Button>
                    </form>
    </Form>
            </CardContent>
            <CardFooter className="flex justify-between text-sm font-semibold text-wrap">
                <Link href="/sign-up" className="w-1/2">Sign In?</Link>
            </CardFooter>
        </Card>
    </div>
  );
}
