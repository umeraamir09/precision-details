"use client"
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FiMenu, FiX, FiPhone } from 'react-icons/fi';
import { Button } from "./shadcn/button";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 py-3' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="relative z-50">
              <Image 
                src="/branding/logo.png" 
                alt="Precision Details" 
                width={140} 
                height={48} 
                className="h-auto w-[110px] sm:w-[130px]" 
                priority 
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors rounded-full hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <a 
                href="tel:+13313078784" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
              >
                <FiPhone className="h-4 w-4" />
                <span className="hidden xl:inline">(331) 307-8784</span>
              </a>
              <Button asChild className="rounded-full px-6">
                <Link href="/pricing">Book Now</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              aria-label="Toggle menu"
              className="lg:hidden relative z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10"
              onClick={() => setOpen(!open)}
            >
              {open ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
            
            {/* Menu Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l border-border/50"
            >
              <div className="flex flex-col h-full pt-24 px-6 pb-8">
                {/* Nav Links */}
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link 
                        href={link.href} 
                        className="block py-3 text-lg font-medium text-white hover:text-primary transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Divider */}
                <div className="my-6 h-px bg-border" />

                {/* Contact Info */}
                <div className="space-y-4">
                  <a 
                    href="tel:+13313078784" 
                    className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors"
                  >
                    <FiPhone className="h-5 w-5" />
                    <span>(331) 307-8784</span>
                  </a>
                </div>

                {/* CTA Button */}
                <div className="mt-auto">
                  <Button asChild className="w-full rounded-full py-6 text-lg" onClick={() => setOpen(false)}>
                    <Link href="/pricing">Book Now</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-20" />
    </>
  );
};

export default Header;
