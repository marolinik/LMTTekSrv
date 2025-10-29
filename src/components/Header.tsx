import { Button } from "./ui/button";
import { ShoppingCart, Menu, Settings, LogOut, User, FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Header = () => {
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const isAdminPage = location.pathname === '/admin';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Don't show header on auth pages
  if (isAuthPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center">
            <img
              src="/lmtek-logo.jpg"
              alt="LM TEK"
              className="h-10 w-auto object-contain"
              style={{ clipPath: 'inset(0 1px 0 0)' }}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/product-info">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-primary">Product Info</Button>
            </Link>
            <Link to="/market-intel">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-primary">Market Intel</Button>
            </Link>
            <Link to="/sales-playbook">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-primary">Sales Playbook</Button>
            </Link>
            <Link to="/lead-generator">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-primary">Lead Generator</Button>
            </Link>
            <Link to="/social-media">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-primary">Social Media</Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                isAdminPage ? (
                  <Link to="/">
                    <Button size="sm" variant="outline" className="rounded-full px-6">
                      Back to Configurator
                    </Button>
                  </Link>
                ) : (
                  <Link to="/admin">
                    <Button size="sm" variant="outline" className="rounded-full px-4">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )
              )}

              {/* User dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-white">
                        {user ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      {user?.role === 'ADMIN' && (
                        <span className="text-xs text-primary font-medium">Admin</span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/my-quotes" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      My Quotes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button size="sm" variant="outline" className="rounded-full px-6">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          <Button variant="ghost" size="icon" className="md:hidden text-gray-700">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
