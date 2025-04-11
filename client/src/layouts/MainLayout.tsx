import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { PlantIcon, DashboardIcon, CalendarIcon, ListCheckIcon, MenuIcon, ImageIcon, MicIcon, GaugeIcon } from "@/utils/icons";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: DashboardIcon },
    { path: "/plants", label: "My Plants", icon: PlantIcon },
    { path: "/calendar", label: "Calendar", icon: CalendarIcon },
    { path: "/tasks", label: "Tasks", icon: ListCheckIcon },
    { path: "/plant-scanner", label: "Plant Scanner", icon: ImageIcon },
    { path: "/voice-assistant", label: "Voice Assistant", icon: MicIcon },
    { path: "/hardware", label: "Hardware", icon: GaugeIcon },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FBF9]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <PlantIcon className="text-[#4CAF50] h-6 w-6 mr-2" />
              <h1 className="text-xl font-bold text-[#4CAF50] font-nunito">PlantPal</h1>
            </div>
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a
                    className={cn(
                      "text-[#2C3E50] hover:text-[#4CAF50] font-medium transition-colors",
                      location === item.path && "text-[#4CAF50]"
                    )}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </div>
            <button 
              className="bg-[#4CAF50] text-white rounded-full w-10 h-10 flex items-center justify-center md:hidden"
              onClick={toggleMobileMenu}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "py-4 flex flex-col items-center",
                  location === item.path ? "text-[#4CAF50]" : "text-[#2C3E50]"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
