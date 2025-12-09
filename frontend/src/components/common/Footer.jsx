import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Heart,
  ExternalLink
} from 'lucide-react';

export default function Footer({ year = new Date().getFullYear() }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    // noop - replace with real API call if you have one
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => setEmail(''), 1200);
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 mt-16">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold">CM</div>
              <div>
                <h4 className="text-xl font-semibold">CareMitra</h4>
                <p className="text-xs text-gray-300 mt-1">Digital healthcare — medicines, labs & doctors in one place.</p>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              Trusted, reliable and easy healthcare access at your fingertips. Fast delivery, verified labs and qualified doctors.
            </p>

            <div className="mt-6">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <label htmlFor="footer-newsletter" className="sr-only">Subscribe to newsletter</label>
                <input
                  id="footer-newsletter"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="w-full sm:w-auto flex-1 min-w-0 rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Enter your email to subscribe"
                />
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium shadow-sm"
                >
                  {subscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-2">We only send essential updates. Unsubscribe anytime.</p>
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <h5 className="text-sm font-semibold mb-3">Explore</h5>
              <ul className="space-y-2 text-sm">
                <li><Link to="/medicines" className="text-gray-300 hover:text-white transition">Medicines</Link></li>
                <li><Link to="/doctors" className="text-gray-300 hover:text-white transition">Doctors</Link></li>
                <li><Link to="/lab-tests" className="text-gray-300 hover:text-white transition">Lab Tests</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-semibold mb-3">Company</h5>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-gray-300 hover:text-white transition">About Us</Link></li>
                <li><Link to="/careers" className="text-gray-300 hover:text-white transition">Careers</Link></li>
                <li><Link to="/blog" className="text-gray-300 hover:text-white transition">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-semibold mb-3">Support</h5>
              <ul className="space-y-2 text-sm">
                <li><Link to="/faq" className="text-gray-300 hover:text-white transition">FAQ</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white transition">Contact</Link></li>
                <li><Link to="/privacy" className="text-gray-300 hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-300 hover:text-white transition">Terms & Conditions</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="md:col-span-3">
            <h5 className="text-sm font-semibold mb-3">Contact Us</h5>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-200" aria-hidden />
                <a href="tel:+9118001234567" className="hover:text-white">+91 1800-123-4567</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-200" aria-hidden />
                <a href="mailto:support@caremitra.com" className="hover:text-white">support@caremitra.com</a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-200 mt-1" aria-hidden />
                <address className="not-italic">123 Healthcare Plaza, New Delhi, India</address>
              </div>
            </div>

            <div className="mt-6">
              <h6 className="text-sm font-semibold mb-2">Follow Us</h6>
              <div className="flex items-center gap-3">
                <a href="#" aria-label="CareMitra on Facebook" className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" aria-label="CareMitra on Twitter" className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" aria-label="CareMitra on Instagram" className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" aria-label="CareMitra on LinkedIn" className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/6 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 flex items-center gap-2">
            <span>© {year} CareMitra</span>
            <span className="hidden sm:inline">• All rights reserved</span>
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 py-1 px-2 rounded-md bg-white/3">Secure</span>
              <span className="inline-flex items-center gap-1 py-1 px-2 rounded-md bg-white/3">Fast delivery</span>
            </div>

            <a href="/sitemap.xml" className="flex items-center gap-1 hover:text-white transition">
              Sitemap <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
