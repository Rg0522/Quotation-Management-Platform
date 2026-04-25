import { User, Role } from "./types";

// JWT mock token creation
export const createMockJWT = (user: User): string => {
  return btoa(
    JSON.stringify({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }),
  );
};

// Parse JWT mock token
export const parseMockJWT = (
  token: string,
): { sub: string; role: Role } | null => {
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.exp && decoded.exp < Date.now()) return null;
    return { sub: decoded.sub, role: decoded.role };
  } catch {
    return null;
  }
};

// LocalStorage helpers
export const saveAuthToken = (token: string) => {
  localStorage.setItem("pactle_auth_token", token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("pactle_auth_token");
};

export const clearAuthToken = () => {
  localStorage.removeItem("pactle_auth_token");
};

export const saveUser = (user: User) => {
  localStorage.setItem("pactle_current_user", JSON.stringify(user));
};

export const getUser = (): User | null => {
  const user = localStorage.getItem("pactle_current_user");
  return user ? JSON.parse(user) : null;
};

export const clearUser = () => {
  localStorage.removeItem("pactle_current_user");
};

// Permission checks
export const permissions = {
  canApproveReject: (role: Role): boolean => {
    return role === "manager";
  },

  canEditFields: (role: Role): boolean => {
    return role === "manager";
  },

  canAddComment: (role: Role): boolean => {
    return role === "manager" || role === "sales_rep";
  },

  canAddReply: (role: Role): boolean => {
    return role === "manager";
  },

  canViewReply: (replyRole: Role, viewerRole: Role): boolean => {
    return replyRole === viewerRole || viewerRole === "manager";
  },

  canViewQuotations: (role: Role): boolean => {
    return true; // All roles can view
  },
};

// Helper to get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format time
export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format datetime
export const formatDateTime = (dateString: string): string => {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
};
