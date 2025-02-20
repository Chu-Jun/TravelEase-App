import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LogoutButton from './LogoutButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default async function AuthButton() {

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole = null;
  let profileLink = null;

  if (user) {
    
    // Get user role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile) {
      userRole = profile.role;
      // Set profile link based on role
      switch (userRole) {
        case 'user':
          profileLink = '/profile';
          break;
      }
    }
  }

  return user ? (
    <div className="flex items-center gap-10">
      <Link href="/" className="font-semibold">Home</Link>
      <Link href="/itinerary-planning" className="font-semibold">Itinerary Planning</Link>
      <Link href="/booking-management" className="font-semibold">Booking Management</Link>
      <Link href="/expense-tracking" className="font-semibold">Expense Management</Link>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <FontAwesomeIcon icon={faUser} size="xl" style={{ width: "24px", height: "24px" }}/>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>
            <Link href={profileLink || "/profile"} className="p-3">View Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LogoutButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <div className="flex gap-10 items-center">
      <Link href="/" className="font-semibold">Home</Link>
      <Link href="/itinerary-planning" className="font-semibold">Itinerary Planning</Link>
      <Link href="/booking-management" className="font-semibold">Booking Management</Link>
      <Link href="/expense-tracking" className="font-semibold">Expense Management</Link>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <FontAwesomeIcon icon={faUser} size="xl" style={{ width: "24px", height: "24px" }}/>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>
            <Link href="/sign-in">Sign in</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/sign-up">Sign up</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
