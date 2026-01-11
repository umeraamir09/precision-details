import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import { FiPhone, FiMail, FiMapPin, FiClock } from "react-icons/fi";

const footerLinks = {
  services: [
    { href: "/pricing", label: "All Services" },
    { href: "/booking/silver", label: "Full Detail" },
    { href: "/booking/upholstery", label: "Interior Detail" },
    { href: "/custom", label: "Custom Package" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/pricing", label: "Pricing" },
  ],
  legal: [
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms of Service" },
  ],
};

const socialLinks = [
  { href: "https://www.instagram.com/pr3cisiondetails/", icon: FaInstagram, label: "Instagram" },
  { href: "#", icon: FaFacebook, label: "Facebook" },
  { href: "#", icon: FaTiktok, label: "TikTok" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-gradient-to-b from-background to-card/30">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <Image 
                src="/branding/logo.png" 
                alt="Precision Details" 
                width={150} 
                height={52} 
                className="h-auto w-[140px]"
              />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Premium mobile detailing services delivering showroom-quality results directly to your location.
            </p>
            
            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <Link 
                  key={social.label}
                  href={social.href} 
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {/* Services */}
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Services</h3>
                <ul className="mt-4 space-y-3">
                  {footerLinks.services.map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Company</h3>
                <ul className="mt-4 space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div className="col-span-2 sm:col-span-1">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Legal</h3>
                <ul className="mt-4 space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Contact Us</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a 
                  href="tel:+13313078784" 
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FiPhone className="w-4 h-4 text-primary" />
                  </span>
                  <span>(331) 307-8784</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:contact@precisiondetails.co" 
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FiMail className="w-4 h-4 text-primary" />
                  </span>
                  <span>contact@precisiondetails.co</span>
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FiMapPin className="w-4 h-4 text-primary" />
                </span>
                <span>Glen Ellyn, IL</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FiClock className="w-4 h-4 text-primary" />
                </span>
                <span>Mon-Fri: 3:30pm-8pm<br />Sat-Sun: 9am-8pm</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Precision Details. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Premium Car Detailing in Glen Ellyn, Wheaton, Naperville & Surrounding Areas
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
