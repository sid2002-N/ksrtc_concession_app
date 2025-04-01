
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

  let navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ];

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
        { href: "/admin/analytics", label: "Analytics" },
        ...navLinks,
      ];
    }
  }

  const isActive = (href: string) => location === href;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
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
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <div className="flex space-x-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`${
                    isActive(link.href)
                      ? "text-primary-600 border-b-2 border-primary-600"
                      : "text-gray-500 hover:text-gray-700"
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
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex space-x-2">
                  <Link href="/auth">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/auth?tab=register">
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
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-150"
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
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1 bg-white shadow-lg rounded-b-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${
                isActive(link.href)
                  ? "bg-primary-50 border-primary-500 text-primary-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="border-t border-gray-200 pt-4 pb-3">
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
                  <div className="text-sm font-medium text-gray-500">{user.userType}</div>
                </div>
                <Button
                  variant="ghost"
                  className="ml-auto flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500"
                  onClick={() => {
                    logoutMutation.mutate();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-6 w-6" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="space-y-1 px-4">
                <Link href="/auth">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth?tab=register">
                  <Button
                    className="w-full justify-start text-left"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
