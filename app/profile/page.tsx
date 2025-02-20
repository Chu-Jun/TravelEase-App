import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

import UserProfileForm from "@/components/UserProfileForm";

export default async function ProfilePage() {

    const supabase = await createClient();

    // get user details from Supabase "profiles" table
    const {
        data: user,
    } = await supabase.from("profiles").select("*").single();

    console.log(user);

    // if user not found(authenticated), redirect to sign-in page
    if (!user) {
        return redirect("/sign-in");
    }

    // redirect to home page
    if (user.role !== "user") {
        return redirect("/");
    }

    return (
        <UserProfileForm />
    );
}