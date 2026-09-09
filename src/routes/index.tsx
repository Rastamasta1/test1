import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Waves,
  Wifi,
  UtensilsCrossed,
  Car,
  Wind,
  Trees,
  Image as ImageIcon,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/")({
  component: VillaLandingPage,
});

const VILLA_NAME = "Villa Serena";

// Real photography was not available to this build (the source images were
// binary files and are intentionally not committed into this workspace), so
// the gallery renders labelled placeholder tiles instead of <img> imports.
// This keeps the build free of any missing-asset resolution errors.
const GALLERY_IMAGES = [
  "Sunlit living room",
  "Private infinity pool",
  "Master bedroom",
  "Outdoor dining terrace",
  "Garden courtyard",
  "Spa-style bathroom",
];

const AMENITIES = [
  {
    icon: Waves,
    title: "Private Pool",
    description: "A quiet infinity pool overlooking the grounds, open all day.",
  },
  {
    icon: Wifi,
    title: "High-Speed Wi-Fi",
    description: "Reliable connectivity throughout the villa and gardens.",
  },
  {
    icon: UtensilsCrossed,
    title: "Full Kitchen",
    description: "A fully equipped kitchen for preparing meals at your own pace.",
  },
  {
    icon: Car,
    title: "Private Parking",
    description: "Secure on-site parking reserved for guests.",
  },
  {
    icon: Wind,
    title: "Air Conditioning",
    description: "Climate control in every room, year-round.",
  },
  {
    icon: Trees,
    title: "Landscaped Garden",
    description: "Quiet outdoor space for relaxing away from the villa.",
  },
];

interface BookingFormState {
  name: string;
  checkIn: string;
  checkOut: string;
  message: string;
}

const EMPTY_FORM: BookingFormState = { name: "", checkIn: "", checkOut: "", message: "" };

function VillaLandingPage() {
  const [form, setForm] = useState<BookingFormState>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(field: keyof BookingFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setForm(EMPTY_FORM);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/20 px-6 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Private Villa Rental
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          {VILLA_NAME}
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-muted-foreground sm:text-lg">
          A calm, professionally kept retreat — quiet grounds, thoughtful details, and space to
          unwind.
        </p>
        <div className="mt-8">
          <a href="#booking">
            <Button size="lg">Request to Book</Button>
          </a>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-6xl px-6 py-16" id="gallery">
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Gallery
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {GALLERY_IMAGES.map((caption) => (
            <figure
              key={caption}
              className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border bg-muted/50 text-muted-foreground transition-colors hover:bg-muted"
            >
              <ImageIcon className="h-8 w-8 opacity-60" aria-hidden="true" />
              <figcaption className="px-3 text-center text-xs">{caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Amenities */}
      <section className="bg-muted/30 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Amenities
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {AMENITIES.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-none bg-card/60 shadow-none">
                <CardHeader className="items-center text-center">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                  {description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Booking form */}
      <section className="mx-auto max-w-2xl px-6 py-16" id="booking">
        <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Request to Book
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Tell us a little about your stay and we&apos;ll get back to you.
        </p>

        <Card>
          <CardContent className="pt-6">
            {submitted ? (
              <p className="text-center text-sm font-medium text-primary" role="status">
                Thank you — your booking request has been received. We&apos;ll be in touch soon.
              </p>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="guest-name">Full name</Label>
                  <Input
                    id="guest-name"
                    name="name"
                    required
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="check-in">Check-in date</Label>
                    <Input
                      id="check-in"
                      name="checkIn"
                      type="date"
                      required
                      value={form.checkIn}
                      onChange={(e) => handleChange("checkIn", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="check-out">Check-out date</Label>
                    <Input
                      id="check-out"
                      name="checkOut"
                      type="date"
                      required
                      value={form.checkOut}
                      onChange={(e) => handleChange("checkOut", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder="Number of guests, special requests, questions…"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Request
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <p className="font-medium text-foreground">{VILLA_NAME}</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <span className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Via delle Colline 12, Tuscany, Italy
            </span>
            <span className="flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" aria-hidden="true" />
              +39 055 123 4567
            </span>
            <span className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" aria-hidden="true" />
              stay@villaserena.example
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
