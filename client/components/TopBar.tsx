import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { getInitials } from "@/lib/auth-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Settings, BarChart3, FileText } from "lucide-react";

export const TopBar = () => {
  const { user, signOut, switchRole } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const roleLabels = {
    manager: "Manager",
    sales_rep: "Sales Rep",
    viewer: "Viewer",
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-bold text-sm">
                P
              </span>
            </div>
            <h1 className="text-lg font-semibold text-foreground hidden sm:block">
              Pactle
            </h1>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive("/")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <FileText className="w-4 h-4" />
              Quotations
            </Link>
            <Link
              to="/analytics"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive("/analytics")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Role Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Role:
            </span>
            <Select value={user.role} onValueChange={switchRole}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="sales_rep">Sales Rep</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm hidden sm:block">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuItem disabled className="text-xs">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
