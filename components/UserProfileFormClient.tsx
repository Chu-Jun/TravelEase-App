'use client'

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"

import { userUpdateProfileAction } from "@/app/actions"
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  username: z.string().min(2, {
      message: "Name must be at least 2 characters."
  }),
  email: z.string().email(),
})

type FormValues = z.infer<typeof formSchema>;

export interface UserProfileFormProps {
  initialData: {
    id: string;
    username: string;
    email: string;
  };
}

export default function UserProfileFormClient({initialData}: UserProfileFormProps) {

    const { toast } = useToast();

    const router = useRouter();

    // Initialize form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: initialData?.username ?? "", // Fallback to empty string
            email: initialData?.email ?? ""   // Fallback to empty string
        },
    });
    
    async function onSubmit(values: any) {

        const mergedObject = { ...values, id: initialData?.id ?? null }
        const result = await userUpdateProfileAction(mergedObject);

        const status = result.status;
        const message = result.message;

        console.log("formdata : "+ mergedObject.values + "result: " + result.message);
        if(status === "success") {
            router.refresh();
        }

        toast({
            variant: status === "error" ? "destructive" : "default",
            title: status === "error" ? "Error" : "Success",
            description: message || "Something went wrong",
        });
    }

    return (
        <div className="p-4 text-black"><Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input className="bg-white" placeholder="Enter your name..." {...field} />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input className="bg-white" placeholder="Enter your email..." {...field} />
                            </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
                />
                <Button type="submit" className="bg-secondary text-white mt-8" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                        <span>Updating...</span>
                    ) : (
                        <span>Update</span>
                    )}
                </Button>
            </form>
        </Form></div>
    );
}