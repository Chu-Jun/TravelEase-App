// components/LogoutButton.tsx
'use client'

import { Button } from './ui/button'
import { createClient } from '@/utils/supabase/client'

export default function LogoutButton() {
  
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
      className="w-full text-left px-0 py-0 font-normal justify-start"
    >
      Sign out
    </Button>

  )
}