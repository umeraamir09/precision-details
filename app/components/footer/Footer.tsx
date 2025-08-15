import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { Button } from "../shadcn/button";

export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-background/60">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Image src="/branding/logo.png" alt="Precision Details" width={140} height={48} />
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-md">
              Premium detailing for those who care about the details.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-white text-lg">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Phone: +1 331 307 8784</li>
              <li>Email: detailswithprecision@gmail.com</li>
              <li>Mon-Fri 3:30pm-8pm; Sat-Sun 9am-8pm</li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-white text-lg">Follow us</h3>
            <div className="mt-4 flex items-center gap-3 text-muted-foreground">
              <Link href="https://www.instagram.com/pr3cisiondetails/" aria-label="Instagram" className="hover:text-white transition-colors"><FaInstagram size={22} /></Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Precision Details. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
