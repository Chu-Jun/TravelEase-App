import { createClient } from '@/utils/supabase/server';
import UserProfileFormClient from './UserProfileFormClient';

export default async function UserProfileForm() {

    const supabase = await createClient();
    
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if(authError){
        console.log("Unable to get user");
    }

    const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser?.id)
    .single();

    if(profileError){
        console.log("Unable to get user profile");
    }

    const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq("id", profileData?.id)
    .single();

    if(error){
        console.log("Unable to get user data");
    }

    const initialData = (userData || {
        id: userData?.id || null,
        username: userData?.username || null,
        email: userData?.email || null,
        emailPreferences: userData?.email_preferences.trip_reminders || null,
    });


    return <UserProfileFormClient initialData={initialData} />;

}