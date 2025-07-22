"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  // Dynamic subtitle based on current route
  const getPageTitle = () => {
    if (pathname?.includes("applications")) {
      return "Applications";
    } else if (pathname?.includes("positions")) {
      return "Positions";
    }
    return "Admin Panel";
  };

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Track navigation state
  useEffect(() => {
    // Initially, there's no forward history
    setCanGoForward(false);

    // Listen for popstate events (back/forward navigation)
    const handlePopState = () => {
      // Small delay to let the navigation complete
      setTimeout(() => {
        // Check if we can go forward by attempting to go forward and back
        const currentLength = window.history.length;
        const currentState = window.history.state;

        // If we came here via back button, we might be able to go forward
        // This is a heuristic since there's no direct API to check forward history
        setCanGoForward(window.history.length > 1);
      }, 100);
    };

    // Listen for navigation events
    window.addEventListener("popstate", handlePopState);

    // Track when user navigates back (enables forward)
    const originalBack = window.history.back;
    window.history.back = () => {
      originalBack.call(window.history);
      setTimeout(() => setCanGoForward(true), 100);
    };

    // Track when user navigates forward (might disable forward)
    const originalForward = window.history.forward;
    window.history.forward = () => {
      originalForward.call(window.history);
      setTimeout(() => {
        // After going forward, check if we can still go forward
        // This is approximate since we can't directly check
        setCanGoForward(false);
      }, 100);
    };

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Restore original methods
      window.history.back = originalBack;
      window.history.forward = originalForward;
    };
  }, []);

  // Reset forward state when navigating to new pages
  useEffect(() => {
    setCanGoForward(false);
  }, [router]);

  const handleBack = () => {
    router.push("/admin");
    // After navigating to a new page, disable forward
    setCanGoForward(false);
  };

  const handleForward = () => {
    if (canGoForward) {
      router.forward();
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm sticky top-0 z-50 dark:bg-gray-900/95 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleBack}
              className="bg-transparent border-none p-0 m-0 hover:bg-transparent focus:outline-none"
            >
              <div className="flex-shrink-0 group">
                <img
                  src="/PPSI.png"
                  alt="PPSI Logo"
                  className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </div>
            </Button>

            <div className="hidden sm:block">
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 transition-all duration-200">
                {getPageTitle()}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back to Admin Dashboard</span>
            </Button>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleForward}
              className={`flex items-center gap-2 transition-all duration-200 ${
                canGoForward
                  ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                  : "text-gray-400 cursor-not-allowed dark:text-gray-600"
              }`}
            ></Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-all duration-200"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50/50 dark:bg-gray-800/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleBack();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Back to Admin</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (canGoForward) {
                    handleForward();
                    setIsMobileMenuOpen(false);
                  }
                }}
                disabled={!canGoForward}
                className={`w-full justify-start flex items-center gap-3 transition-all duration-200 ${
                  canGoForward
                    ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                    : "text-gray-400 cursor-not-allowed dark:text-gray-600"
                }`}
              ></Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
