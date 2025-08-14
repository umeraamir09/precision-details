"use client"
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaAngleDown } from 'react-icons/fa';
import { FiMenu, FiX } from 'react-icons/fi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/shadcn/select"
import { Button } from "./shadcn/button";

const Header = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-accent/80 backdrop-blur supports-[backdrop-filter]:bg-accent/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
        <Link href="/" className="inline-flex items-center">
          <Image src="/branding/logo.png" alt="Logo" width={130} height={80} className="h-auto w-[120px] sm:w-[140px]" />
        </Link>

        {/* Desktop nav */}
        <nav className="ml-auto hidden md:flex items-center gap-5">
          <Link href="/" className="text-sm lg:text-base">Home</Link>
          <Link href="/pricing" className="text-sm lg:text-base">Pricing</Link>
          <Link href={'/contact'} className="text-sm lg:text-base">Contact</Link>
          <Button asChild className="m-0 text-white rounded-full">
            <Link href="/pricing">Book Now</Link>
          </Button>
        </nav>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle menu"
          className="ml-auto md:hidden inline-flex items-center justify-center rounded-md border bg-background/70 p-2"
          onClick={() => setOpen(!open)}
        >
          {open ? <FiX className="size-5" /> : <FiMenu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-2">
            <Link href="/" className="py-2" onClick={() => setOpen(false)}>Home</Link>
            <Link href="/pricing" className="py-2" onClick={() => setOpen(false)}>Pricing</Link>
            <Link href={'/contact'} className="py-2" onClick={() => setOpen(false)}>Contact</Link>
            <Button asChild className="mt-2 w-full text-white rounded-full" onClick={() => setOpen(false)}>
              <Link href="/pricing">Book Now</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header