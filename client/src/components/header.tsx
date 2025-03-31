import React from "react";
import { Link, useLocation } from "wouter";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { UserType } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";

const Header: React.FC = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getRoleLabel = (userType: UserType) => {
    switch (userType) {
      case UserType.STUDENT:
        return "Student";
      case UserType.COLLEGE:
        return "College Admin";
      case UserType.DEPOT:
        return "Depot Manager";
      default:
        return "User";
    }
  };

  const getDashboardLink = (userType: UserType) => {
    switch (userType) {
      case UserType.STUDENT:
        return "/student/dashboard";
      case UserType.COLLEGE:
        return "/college/dashboard";
      case UserType.DEPOT:
        return "/depot/dashboard";
      default:
        return "/";
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <GraduationCap className="h-8 w-8 text-primary" />
                  <span className="ml-2 text-xl font-bold">KSRTC Concession</span>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="ml-6 flex space-x-8">
                <Link href="/">
                  <span className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${location === "/" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500 hover:text-gray-700"}`}>
                    Home
                  </span>
                </Link>
                <Link href="/analytics/dashboard">
                  <span className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${location.startsWith("/analytics") ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500 hover:text-gray-700"}`}>
                    Analytics
                  </span>
                </Link>
                <Link href="/about">
                  <span className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${location === "/about" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500 hover:text-gray-700"}`}>
                    About
                  </span>
                </Link>
                <Link href="/contact">
                  <span className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${location === "/contact" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500 hover:text-gray-700"}`}>
                    Contact
                  </span>
                </Link>
                <Link href="/faq">
                  <span className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${location === "/faq" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500 hover:text-gray-700"}`}>
                    FAQ
                  </span>
                </Link>
              </nav>
            )}
          </div>
          
          {/* Mobile menu button */}
          {isMobile && (
            <div className="-mr-2 flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          )}
          
          {/* User Profile */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-3">
                {!isMobile && (
                  <>
                    <Link href={getDashboardLink(user.userType)}>
                      <Button variant="outline" size="sm">
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                )}
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-3 hidden md:block">
                    {user.username}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary-100 text-primary-700">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link href="/auth?tab=login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth?tab=register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state. */}
      {isMobile && mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/">
              <span className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${location === "/" ? "border-primary-500 text-primary-700 bg-primary-50" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"}`}>
                Home
              </span>
            </Link>
            <Link href="/analytics/dashboard">
              <span className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${location.startsWith("/analytics") ? "border-primary-500 text-primary-700 bg-primary-50" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"}`}>
                Analytics
              </span>
            </Link>
            <Link href="/about">
              <span className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${location === "/about" ? "border-primary-500 text-primary-700 bg-primary-50" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"}`}>
                About
              </span>
            </Link>
            <Link href="/contact">
              <span className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${location === "/contact" ? "border-primary-500 text-primary-700 bg-primary-50" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"}`}>
                Contact
              </span>
            </Link>
            <Link href="/faq">
              <span className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${location === "/faq" ? "border-primary-500 text-primary-700 bg-primary-50" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"}`}>
                FAQ
              </span>
            </Link>
            {user && (
              <>
                <Link href={getDashboardLink(user.userType)}>
                  <span className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700">
                    Dashboard
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;