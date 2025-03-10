'use client'

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { userUpdateProfileAction } from "@/app/actions"
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  username: z.string().min(2, {
      message: "Name must be at least 2 characters."
  }),
  email: z.string().email(),
  tripReminders: z.boolean(),
  reminderDays: z.number().min(1).max(30)
})

type FormValues = z.infer<typeof formSchema>;

export interface UserProfileFormProps {
  initialData: {
    id: string;
    username: string;
    email: string;
    reminder_days: number;
    email_preferences: {
      trip_reminders: boolean;
    };
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
            email: initialData?.email ?? "",   // Fallback to empty string
            tripReminders: initialData?.email_preferences.trip_reminders ?? true,
            reminderDays: initialData?.reminder_days ?? 5
        },
    });
    
    async function onSubmit(values: any) {
        // Prepare data structure for the backend
        const mergedObject = { 
          id: initialData?.id ?? null,
          username: values.username,
          email: values.email,
          reminder_days: values.reminderDays,
          email_preferences: {
            trip_reminders: values.tripReminders
          }
        };
        
        const result = await userUpdateProfileAction(mergedObject);

        const status = result.status;
        const message = result.message;

        console.log("formdata:", mergedObject, "result:", result.message);
        
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
        <div className="m-32 p-4 text-black bg-white rounded-md">
          <Form {...form}>
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
                
                <FormField
                  control={form.control}
                  name="tripReminders"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Email Notifications</FormLabel>
                          <FormControl>
                              <Select 
                                onValueChange={(value) => field.onChange(value === "true")} 
                                defaultValue={field.value ? "true" : "false"}
                              >
                                  <FormControl className="bg-white">
                                      <SelectTrigger>
                                          <SelectValue placeholder="Select Email Preferences" />
                                      </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-white text-title">
                                      <SelectItem value="true">Accept Trip Reminders</SelectItem>
                                      <SelectItem value="false">Do Not Send Reminders</SelectItem>
                                  </SelectContent>
                              </Select>
                          </FormControl>
                          <FormMessage/>
                      </FormItem>
                  )}
                />
                
                <FormField
                control={form.control}
                name="reminderDays"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Reminder Days Before Trip</FormLabel>
                    <FormControl>
                        <Input
                        className="bg-white"
                        type="number"
                        placeholder="Enter your day preferred..."
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))} // Convert string to number
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <Button type="submit" className="bg-primary text-white mt-8" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                        <span>Updating...</span>
                    ) : (
                        <span>Update</span>
                    )}
                </Button>
            </form>
          </Form>
        </div>
    );
}