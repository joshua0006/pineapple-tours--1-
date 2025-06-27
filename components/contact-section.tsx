import Link from "next/link";
import {
  MessageCircle,
  Clock,
  Star,
  Gift,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactSection() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center">
          <MessageCircle className="h-6 w-6 text-brand-accent" />
        </div>
        <h2 className="font-secondary text-3xl font-normal tracking-tight text-brand-text">
          Contact Us
        </h2>
      </div>

      <p className="font-text text-lg text-brand-text/70 leading-relaxed max-w-2xl">
        Ready to explore? Our team is here to help plan your perfect adventure.
      </p>

      {/* Compact Contact Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="bg-brand-secondary p-6 rounded-lg border border-brand-accent/20 shadow-sm">
          <h3 className="font-secondary text-lg font-normal text-brand-text mb-4">
            Get in Touch
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-brand-accent flex-shrink-0" />
              <a
                href="tel:0466331232"
                className="font-text text-base text-brand-accent hover:text-brand-accent/80 transition-colors"
              >
                0466 331 232
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-brand-accent flex-shrink-0" />
              <a
                href="mailto:bookings@pineappletours.com.au"
                className="font-text text-sm text-brand-accent hover:text-brand-accent/80 transition-colors break-all"
              >
                bookings@pineappletours.com.au
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-brand-accent flex-shrink-0" />
              <span className="font-text text-base text-brand-text/60">
                2hr response time
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a href="tel:0466331232">
                <Button
                  size="default"
                  className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90 w-full font-text text-base font-normal"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Social & CTA */}
        <div className="bg-brand-secondary p-6 rounded-lg border border-brand-accent/20 shadow-sm">
          <h3 className="font-secondary text-lg font-normal text-brand-text mb-4">
            Connect
          </h3>
          <div className="space-y-3 mb-4">
            <a
              href="https://www.facebook.com/pineappletoursAU/?_rdc=1&_rdr#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:bg-brand-accent/5 p-2 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Facebook className="h-5 w-5 text-blue-500" />
              </div>
              <span className="font-text text-base text-brand-text/70">
                Like us on Facebook
              </span>
            </a>
            <a
              href="https://www.instagram.com/pineappletours.com.au/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:bg-brand-accent/5 p-2 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-pink-500/10 rounded-full flex items-center justify-center">
                <Instagram className="h-5 w-5 text-pink-500" />
              </div>
              <span className="font-text text-base text-brand-text/70">
                Follow us on Instagram
              </span>
            </a>
            <a
              href="https://www.youtube.com/channel/UCAvl12VYyJ06rru5nQc0QbQ/featured"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:bg-brand-accent/5 p-2 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                <Youtube className="h-5 w-5 text-red-500" />
              </div>
              <span className="font-text text-base text-brand-text/70">
                Visit our channel on Youtube
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
