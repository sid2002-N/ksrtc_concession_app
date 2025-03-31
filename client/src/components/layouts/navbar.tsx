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

  // Determine nav links based on user type
  let navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ];

  // Add dashboard link if user is logged in
  if (user) {
    if (user.userType === UserType.STUDENT) {
      navLinks = [
        { href: "/student/dashboard", label: "Dashboard" },
        { href: "/student/apply", label: "Apply" },
        ...navLinks,
      ];
    } else if (user.userType === UserType.COLLEGE) {
      navLinks = [
        { href: "/college/dashboard", label: "Dashboard" },
        ...navLinks,
      ];
    } else if (user.userType === UserType.DEPOT) {
      navLinks = [
        { href: "/depot/dashboard", label: "Dashboard" },
        { href: "/admin/analytics", label: "Analytics" }, // Added analytics link
        ...navLinks,
      ];
    }
  }

  const isActive = (href: string) => location === href;

  return (
    <nav className="bg-white shadow relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <svg className="h-10 w-10 text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 4H4V9H9V4Z" fill="currentColor" />
                    <path d="M9 15H4V20H9V15Z" fill="currentColor" />
                    <path d="M20 4H15V9H20V4Z" fill="currentColor" />
                    <path d="M20 15H15V20H20V15Z" fill="currentColor" />
                    <path d="M4 9H20V15H4V9Z" fill="currentColor" />
                  </svg>
                  <span className="ml-2 font-semibold text-primary-500 text-lg">KSRTC Online Concession</span>
                </div>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`${
                    isActive(link.href)
                      ? "border-primary-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
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
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link 
                  href="/auth"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link 
                  href="/auth?tab=register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded="false"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
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
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
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
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-800 font-medium text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.username}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
                <Button
                  variant="ghost"
                  className="ml-auto flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="h-6 w-6" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <div className="space-y-1 px-4">
                <Link 
                  href="/auth"
                  className="block text-gray-500 hover:bg-gray-100 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/auth?tab=register"
                  className="block text-gray-500 hover:bg-gray-100 px-3 py-2 rounded-md text-base font-medium"
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