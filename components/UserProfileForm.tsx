import { createClient } from '@/utils/supabase/server';
import UserProfileFormClient from './UserProfileFormClient';

export default async function UserProfileForm() {

    const supabase = await createClient();
    
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser?.id)
    .single();

    const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq("id", profileData?.id)
    .single();

    const initialData = (userData || {
        id: userData?.id || null,
        username: userData?.username || null,
        email: userData?.email || null,
    });


    return <UserProfileFormClient initialData={initialData} />;

}