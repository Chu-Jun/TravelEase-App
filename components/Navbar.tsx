"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

function Navbar ({
  children,
}: {
  children: React.ReactNode
})  {
  console.log(children);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
          setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => {
          window.removeEventListener("scroll", handleScroll);
        };
      }, []);

  return (
    <div className={`p-8 lg:px-16 lg:py-5 flex justify-between items-center fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/70 backdrop-blur-md shadow-md" : "bg-white shadow-md"
      }`}>
        <Link href="/">
            <Image
            className="dark:invert"
            src="/assets/travelease_logo.png"
            alt="TravelEase Logo"
            width={110}
            height={35}
            priority
            />
        </Link>
        {children}
    </div>
  )
}

export default Navbar