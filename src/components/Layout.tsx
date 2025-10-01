import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  Folder,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Tag,
  Users,
  BarChart2,
  LayoutDashboard,
  Search,
  Bell
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface LayoutProps {
  user: any;
}

export function Layout({ user }: LayoutProps) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Initialize based on screen size if window is available
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  useEffect(() => {
    // Set initial sidebar visibility based on screen size
    const handleResize = () => {
      const shouldShow = window.innerWidth >= 1024;
      setIsSidebarOpen(shouldShow);
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ensure sidebar is visible on large screens when location changes
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/articles", icon: BookOpen, label: "Articles" },
    { path: "/categories", icon: Tag, label: "Categories" },
    { path: "/media", icon: Image, label: "Media Library" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="flex h-screen">
        {/* Mobile Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={closeSidebar}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{
            x: isSidebarOpen ? 0 : "-100%",
          }}
          className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg text-gray-900 flex flex-col lg:relative lg:translate-x-0 lg:z-0"
        >
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                    <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Traibe<span className="text-green-500">Tech</span>
                  </h1>
                  <p className="text-gray-500 text-sm"></p>
                </div>
              </div>
              {/* Close button for mobile */}
              <button
                onClick={closeSidebar}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeSidebar}
                    className={`flex items-center px-6 py-4 rounded-full transition-all duration-300 group ${
                      active
                        ? "text-white bg-gradient-to-r from-green-500 to-green-600 shadow-lg"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-4 ${active ? "text-white" : "text-gray-400 group-hover:text-green-500"} transition-colors duration-300`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Info & Logout */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                {user?.email ? user.email[0].toUpperCase() : <Users className="w-5 h-5" />}
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.email || "Guest User"}
                </p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {location.pathname === "/" ? "Dashboard" : location.pathname.substring(1).split('/')[0].charAt(0).toUpperCase() + location.pathname.substring(1).split('/')[0].slice(1)}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search - Hidden on mobile */}
              <div className="hidden sm:block relative">
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-48 lg:w-64 px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              
              {/* User Profile Dropdown */}
              <div className="relative">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm font-semibold">
                    {user?.email ? user.email[0].toUpperCase() : <Users className="w-4 h-4" />}
                  </div>
                  <span className="font-medium hidden md:block">{user?.email?.split('@')[0] || "Guest"}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}