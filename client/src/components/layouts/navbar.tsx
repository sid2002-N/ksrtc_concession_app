import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { UserType } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Base navigation links that are always shown
  const baseNavLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ];

  // Initialize navLinks with base links
  let navLinks = [...baseNavLinks];

  // Add role-specific links only when user is logged in
  if (user) {
    if (user.userType === UserType.STUDENT) {
      navLinks = [
        { href: "/student/dashboard", label: "Dashboard" },
        { href: "/student/apply", label: "Apply" },
        ...baseNavLinks,
      ];
    } else if (user.userType === UserType.COLLEGE) {
      navLinks = [
        { href: "/college/dashboard", label: "Dashboard" },
        ...baseNavLinks,
      ];
    } else if (user.userType === UserType.DEPOT) {
      navLinks = [
        { href: "/depot/dashboard", label: "Dashboard" },
        { href: "/admin/analytics", label: "Analytics" },
        ...baseNavLinks,
      ];
    }
  }

  const isActive = (href: string) => location === href;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <svg className="h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none">
                  <path d="M9 4H4V9H9V4Z" fill="currentColor" />
                  <path d="M9 15H4V20H9V15Z" fill="currentColor" />
                  <path d="M20 4H15V9H20V4Z" fill="currentColor" />
                  <path d="M20 15H15V20H20V15Z" fill="currentColor" />
                  <path d="M4 9H20V15H4V9Z" fill="currentColor" />
                </svg>
                <span className="ml-2 text-lg font-semibold text-gray-900 hidden sm:block">KSRTC Concession</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:ml-6 sm:space-x-8">
            <div className="flex space-x-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`${
                    isActive(link.href)
                      ? "text-primary-600 border-b-2 border-primary-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                  } px-3 py-2 text-sm font-medium transition-colors duration-150`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            <div className="ml-4 flex items-center">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-600">
                      {user.username} <span className="ml-2 text-xs opacity-50">{user.userType}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex space-x-4">
                  <Link href="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${
                  isActive(link.href)
                    ? "bg-primary-50 border-primary-500 text-primary-700"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Button variant="ghost" onClick={() => logoutMutation.mutate()}>
                    <LogOut className="h-5 w-5" />
                    <span className="ml-2">Logout</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-1">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
