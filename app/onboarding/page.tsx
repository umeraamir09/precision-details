"use client";
import React, { useState } from "react";

const steps = [
  "Personal Info",
  "Contact Info",
  "Book Appointment",
  "Review & Confirm",
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
};

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
  });
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    name: false,
    email: false,
    phone: false,
    date: false,
    time: false,
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setTouched({ ...touched, [e.target.name]: true } as typeof touched);
  };

  const validEmail = (v: string) => /.+@.+\..+/.test(v);
  const validPhone = (v: string) => v.replace(/\D/g, "").length >= 10;

  const isStepValid = (s: number) => {
    if (s === 0) return form.name.trim().length >= 2;
    if (s === 1) return validEmail(form.email) && validPhone(form.phone);
    if (s === 2) return Boolean(form.date) && Boolean(form.time);
    return true;
  };

  const markTouchedForStep = (s: number) => {
    if (s === 0) setTouched((t) => ({ ...t, name: true }));
    if (s === 1) setTouched((t) => ({ ...t, email: true, phone: true }));
    if (s === 2) setTouched((t) => ({ ...t, date: true, time: true }));
  };

  const nextStep = () => {
    setError(null);
    if (!isStepValid(step)) {
      markTouchedForStep(step);
      setError("Please complete the required fields to continue.");
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  // Cal.com embed with prefilled user info
  const calComUrl = `https://cal.com/precisiondetails?name=${encodeURIComponent(form.name)}&email=${encodeURIComponent(form.email)}&phone=${encodeURIComponent(form.phone)}`;
  const calComEmbed = (
    <iframe
      src={calComUrl}
      className="w-full h-[420px] md:h-[560px] rounded-xl border border-blue-200 shadow-sm"
      title="Book Appointment"
      allow="camera; microphone;"
      style={{ background: "#f8fafc" }}
    />
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0e7ff] via-white to-[#f1f5f9] px-3 py-8">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 md:p-10 flex flex-col gap-6 md:gap-8 border border-blue-100">
        {/* Header + Stepper */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1e293b] tracking-tight">
            Book Your Appointment
          </h1>
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-blue-100 rounded"></div>
            <div className="flex items-center justify-between relative">
              {steps.map((label, idx) => {
                const active = idx <= step;
                return (
                  <div key={label} className="flex flex-col items-center w-1/4">
                    <div
                      aria-current={active ? "step" : undefined}
                      className={`z-10 w-9 h-9 md:w-10 md:h-10 rounded-full grid place-items-center text-xs md:text-sm font-semibold shadow transition-all duration-200 ${active ? "bg-[#2563eb] text-white" : "bg-blue-100 text-[#2563eb]"}`}
                    >
                      {idx + 1}
                    </div>
                    <span className="mt-2 text-[10px] md:text-xs text-[#1e293b] text-center leading-tight">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Steps Content */}
        <div className="w-full">
          {step === 0 && (
            <div className="flex flex-col gap-6">
              <label className="text-lg font-medium text-[#1e293b]" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`border ${touched.name && !form.name ? "border-red-400" : "border-blue-200"} rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-base text-black`}
                placeholder="Enter your full name"
                autoComplete="name"
                autoFocus
                minLength={2}
                required
                aria-invalid={touched.name && !form.name}
              />
              {touched.name && !form.name && (
                <span className="text-red-500 text-sm">Name is required.</span>
              )}
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid(0)}
                  className={`px-6 py-2 rounded-lg font-semibold shadow transition-all duration-200 ${isStepValid(0) ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white" : "bg-blue-100 text-blue-400 cursor-not-allowed"}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-6">
              <label className="text-lg font-medium text-[#1e293b]" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`border ${touched.email && !validEmail(form.email) ? "border-red-400" : "text-black border-blue-200"} rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-base`}
                placeholder="Enter your email"
                autoComplete="email"
                type="email"
                required
                aria-invalid={touched.email && !validEmail(form.email)}
              />
              {touched.email && !validEmail(form.email) && (
                <span className="text-red-500 text-sm">Enter a valid email.</span>
              )}

              <label className="text-lg font-medium text-[#1e293b]" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={`border ${touched.phone && !validPhone(form.phone) ? "border-red-400" : "text-black border-blue-200"} rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-base`}
                placeholder="Enter your phone number"
                autoComplete="tel"
                type="tel"
                required
                aria-invalid={touched.phone && !validPhone(form.phone)}
              />
              {touched.phone && !validPhone(form.phone) && (
                <span className="text-red-500 text-sm">Enter a valid phone number.</span>
              )}

              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-blue-50 hover:bg-blue-100 text-[#2563eb] px-6 py-2 rounded-lg font-semibold shadow transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid(1)}
                  className={`px-6 py-2 rounded-lg font-semibold shadow transition-all duration-200 ${isStepValid(1) ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white" : "bg-blue-100 text-blue-400 cursor-not-allowed"}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <h3 className="text-lg font-medium text-[#1e293b] mb-2">Select your appointment date and time</h3>
              <div className="w-full my-4">{calComEmbed}</div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-blue-50 hover:bg-blue-100 text-[#2563eb] px-6 py-2 rounded-lg font-semibold shadow transition-all duration-200"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <h3 className="text-xl md:text-2xl font-bold text-[#2563eb] mb-2">Review & Confirm</h3>
              <div className="bg-blue-50 rounded-lg p-4 shadow flex flex-col gap-2">
                <div className="flex justify-between text-base md:text-lg">
                  <span className="font-semibold text-[#1e293b]">Name:</span>
                  <span className="text-[#2563eb]">{form.name}</span>
                </div>
                <div className="flex justify-between text-base md:text-lg">
                  <span className="font-semibold text-[#1e293b]">Email:</span>
                  <span className="text-[#2563eb]">{form.email}</span>
                </div>
                <div className="flex justify-between text-base md:text-lg">
                  <span className="font-semibold text-[#1e293b]">Phone:</span>
                  <span className="text-[#2563eb]">{form.phone}</span>
                </div>
                <div className="flex justify-between text-base md:text-lg">
                  <span className="font-semibold text-[#1e293b]">Date:</span>
                  <span className="text-[#2563eb]">{form.date}</span>
                </div>
                <div className="flex justify-between text-base md:text-lg">
                  <span className="font-semibold text-[#1e293b]">Time:</span>
                  <span className="text-[#2563eb]">{form.time}</span>
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-blue-50 hover:bg-blue-100 text-[#2563eb] px-6 py-2 rounded-lg font-semibold shadow transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition-all duration-200"
                  onClick={() => {
                    // You can send this to an API or Cal.com webhook if needed
                    alert("Booking confirmed! We'll reach out with details.");
                  }}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
