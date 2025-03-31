import React from "react";
import { Link } from "wouter";
import { 
  Bus, 
  GraduationCap, 
  FileText, 
  Phone, 
  Mail, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer: React.FC = () => {
  return (
    <footer className="bg-softGrey border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold gradient-text">KSRTC Concession</span>
            </div>
            <p className="text-gray-600 text-sm">
              Streamlining student transport concessions through our digital platform, making travel more accessible for students across Kerala.
            </p>
            <div className="flex space-x-3 pt-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className="hover-scale hover:text-primary"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer" 
                className="hover-scale hover:text-primary"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="hover-scale hover:text-primary"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="hover-scale hover:text-primary"
                aria-label="Youtube"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="nav-link text-gray-600 hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="nav-link text-gray-600 hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link href="/faq" className="nav-link text-gray-600 hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="nav-link text-gray-600 hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/analytics/dashboard" className="nav-link text-gray-600 hover:text-primary">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/auth" className="nav-link text-gray-600 hover:text-primary">
                  Login/Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-gray-600">
                  Kerala State Road Transport Corporation<br />
                  Transport Bhavan, Fort P.O<br />
                  Thiruvananthapuram - 695023
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-2" />
                <span className="text-gray-600">+91 471 2471011</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-2" />
                <span className="text-gray-600">info@keralartc.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Newsletter</h3>
            <p className="text-gray-600 text-sm">
              Subscribe to our newsletter for the latest updates and information on student concessions.
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button 
                variant="ghost" 
                className="absolute right-0 top-0 h-full hover:bg-primary hover:text-white rounded-l-none"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-5 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} KSRTC Concession Portal. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-500 text-sm hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 text-sm hover:text-primary">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="text-gray-500 text-sm hover:text-primary">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;