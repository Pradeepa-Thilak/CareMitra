import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-16">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">About CareMitra</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              CareMitra is your trusted digital healthcare platform providing access to medicines, doctor consultations, and lab tests all in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/medicines" className="text-gray-300 hover:text-white transition">
                  Medicines
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="text-gray-300 hover:text-white transition">
                  Doctors
                </Link>
              </li>
              <li>
                <Link to="/lab-tests" className="text-gray-300 hover:text-white transition">
                  Lab Tests
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="text-gray-300">+91 1800-123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-gray-300">support@caremitra.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1" />
                <span className="text-gray-300">123 Healthcare Plaza, New Delhi, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-700 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex gap-4 mb-4 sm:mb-0">
            <a href="#" className="text-gray-300 hover:text-white transition">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
          <p className="text-gray-300 text-sm">
            &copy; 2024 CareMitra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
