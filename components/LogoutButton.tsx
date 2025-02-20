// components/LogoutButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { createClient } from '@/utils/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  
  const handleSignOut = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Error logging out:', error);
    } else {
        // Redirect to login page or update UI as needed
        window.location.href = '/';
    }
  }

  return (
    <Button 
      onClick={handleSignOut} 
      type="button" 
      size="sm" 
      variant="ghost"
      className="w-full text-left"
    >
      Sign out
    </Button>
  )
}