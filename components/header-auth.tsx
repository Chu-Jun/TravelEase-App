"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Import usePathname hook
import { faUser, faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LogoutButton from './LogoutButton';
import { createClient } from "@/utils/supabase/client"; // Use client-side Supabase client
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useAuth } from "@/context/AuthContext";

// Define types for navigation links and user
interface NavLink {
  href: string;
  label: string;
}

// Define a User type to match what Supabase returns
interface User {
  id: string;
  // Add other user properties you need
}

export default function AuthButton() {
  const { isAuth } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [profileLink, setProfileLink] = useState("/profile");
  const pathname = usePathname(); // Get current path

  // Navigation links array to reuse in both desktop and mobile views
  const navLinks: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/itinerary-planning", label: "Trip Planning" },
    { href: "/booking-management", label: "Booking Management" },
    { href: "/expense-tracking", label: "Expense Management" },
  ];

  useEffect(() => {
    async function loadUserData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get user role from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profile && profile.role === 'user') {
            setProfileLink('/profile');
          }
        }
        
        setUser(user as User | null);
        console.log(user);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    }

    loadUserData();
  }, []);

  // Helper function to determine if a link is active
  const isActiveLink = (href: string): boolean => {
    if (href === "/" && pathname === "/") {
      return true;
    }
    return href !== "/" && pathname.startsWith(href);
  };

  // Client component for user menu dropdown
  function UserMenu({ profileLink }: { profileLink: string }) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <FontAwesomeIcon icon={faUser} size="xl" style={{ width: "24px", height: "24px" }} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isAuth ? (
            <>
              <DropdownMenuItem className={pathname === profileLink ? "text-gray-500" : ""}>
                <Link href={profileLink} className="w-full">View Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogoutButton />
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem className={pathname === "/sign-in" ? "text-gray-500" : ""}>
                <Link href="/sign-in" className="w-full">Sign in</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className={pathname === "/sign-up" ? "text-gray-500" : ""}>
                <Link href="/sign-up" className="w-full">Sign up</Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Client component for mobile navigation
  function MobileNavigation({ 
    navLinks, 
    profileLink 
  }: { 
    navLinks: NavLink[]; 
    profileLink: string 
  }) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2">
          <FontAwesomeIcon icon={faBars} size="xl" style={{ width: "24px", height: "24px" }} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Navigation</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Navigation Links with active highlighting */}
          {navLinks.map((link: NavLink) => (
            <DropdownMenuItem key={link.href} className={isActiveLink(link.href) ? "text-gray-500" : ""}>
              <Link href={link.href} className="w-full">
                {link.label}
              </Link>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* User Account Options with active highlighting */}
          {isAuth ? (
            <>
              <DropdownMenuItem className={pathname === profileLink ? "text-gray-500" : ""}>
                <Link href={profileLink} className="w-full">View Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogoutButton />
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem className={pathname === "/sign-in" ? "text-gray-500" : ""}>
                <Link href="/sign-in" className="w-full">Sign in</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className={pathname === "/sign-up" ? "text-gray-500" : ""}>
                <Link href="/sign-up" className="w-full">Sign up</Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="w-full flex justify-end items-center">
      {/* Desktop Navigation - Now right-aligned with active highlighting */}
      <div className="hidden md:flex items-center gap-10">
        {navLinks.map((link: NavLink) => (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`font-semibold transition-colors hover:pointer ${isActiveLink(link.href) ? "text-gray-500" : "hover:text-gray-500"}`}
          >
            {link.label}
          </Link>
        ))}
        <UserMenu profileLink={profileLink} />
      </div>

      {/* Mobile Navigation - Now right-aligned */}
      <div className="md:hidden flex items-center gap-2">
        <MobileNavigation navLinks={navLinks} profileLink={profileLink} />
      </div>
    </div>
  );
}