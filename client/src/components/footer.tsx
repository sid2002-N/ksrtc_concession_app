import React from "react";
import { Link } from "wouter";
import { GraduationCap } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6" />
              <span className="font-bold">KSRTC Concession</span>
            </div>
            <p className="text-sm text-gray-600">
              Streamlining the student concession process for Kerala State Road Transport Corporation.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-sm uppercase mb-4 tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:underline">Home</Link>
              </li>
              <li>
                <Link href="/about" className="hover:underline">About</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">Contact</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:underline">FAQ</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-sm uppercase mb-4 tracking-wider">Information</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:underline">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:underline">Accessibility</Link>
              </li>
              <li>
                <Link href="/help" className="hover:underline">Help Center</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-sm uppercase mb-4 tracking-wider">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="block">KSRTC Head Office</span>
                <span className="block text-gray-600">Transport Bhavan</span>
                <span className="block text-gray-600">East Fort, Thiruvananthapuram</span>
                <span className="block text-gray-600">Kerala, India - 695023</span>
              </li>
              <li className="pt-2">
                <span className="block">Email: info@ksrtc.kerala.gov.in</span>
                <span className="block">Phone: +91-471-2471011</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">
            &copy; {currentYear} Kerala State Road Transport Corporation. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a 
              href="https://www.facebook.com/KeralaSRTC/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              Facebook
            </a>
            <a 
              href="https://twitter.com/KeralaRTC" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              Twitter
            </a>
            <a 
              href="https://www.instagram.com/keralartc/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;