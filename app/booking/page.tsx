import { Metadata } from "next";
import Link from "next/link";
import { Button } from "../components/shadcn/button";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description: "Schedule your detailing appointment with Precision Details using our Cal.com booking page.",
};

const calComUrl = "https://cal.com/precisiondetails";

export default function BookingPage() {
  return (
    <main className="min-h-svh bg-background">
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 lg:px-8 text-center">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Book Now</span>
          <h1 className="mt-4 font-heading text-4xl sm:text-5xl font-bold text-white">
            Schedule Your Detail in Minutes
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Pick a time that works best for you. Once you submit, we&apos;ll confirm all the details and get to work.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="rounded-3xl border border-border/50 bg-card/80 p-4 md:p-6 shadow-lg">
            <iframe
              src={calComUrl}
              title="Precision Details booking"
              className="h-[720px] w-full rounded-2xl border border-border/50"
              allow="camera; microphone;"
            />
          </div>
          <div className="mt-6 text-center">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/pricing">View Packages &amp; Add-Ons</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
