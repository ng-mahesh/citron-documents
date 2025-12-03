/**
 * Global Theme Configuration
 * Based on Citron Society Logo Colors
 *
 * To change the color scheme in the future, simply update the values in this file.
 */

export const theme = {
  colors: {
    // Primary Colors (Green from logo)
    primary: {
      DEFAULT: "#175a00",
      dark: "#185900",
      light: "#185a00",
      accent: "#99fe00",
    },

    // Secondary Colors (Yellow from logo)
    secondary: {
      DEFAULT: "#ffff01",
      light: "#fffeff",
    },

    // Neutral Colors
    neutral: {
      white: "#ffffff",
      black: "#000000",
    },

    // Gradient Classes
    gradients: {
      primary: "from-[#175a00] to-[#185900]",
      primaryReverse: "from-[#185900] to-[#175a00]",
      accent: "from-[#175a00] to-[#99fe00]",
      text: "from-[#175a00] to-[#185a00]",
    },

    // Shadow Colors
    shadows: {
      primary: "shadow-green-200",
      primaryDark: "shadow-green-300",
    },

    // Hover States
    hover: {
      primary: "#185a00",
      border: "#99fe00",
    },

    // Background Colors
    background: {
      primary: "bg-gradient-to-br from-green-50 via-white to-slate-50",
      section: "bg-gradient-to-br from-green-50 via-white to-slate-50",
      blur: "from-[#175a00] to-[#185900]",
    },
  },

  // Card & Section Colors
  card: {
    border: "#175a00",
    borderLight: "border-green-200",
    borderHover: "hover:border-[#99fe00]",
    shadow: "shadow-green-100/50",
    shadowHover: "shadow-green-200",
  },

  // Icon Background Classes
  iconBg: {
    primary: "bg-gradient-to-br from-[#175a00] to-[#185900]",
    blue: "bg-gradient-to-br from-blue-500 to-blue-600",
    purple: "bg-gradient-to-br from-purple-500 to-purple-600",
    green: "bg-gradient-to-br from-[#175a00] to-[#99fe00]",
    amber: "bg-gradient-to-br from-amber-500 to-amber-600",
  },

  // Button Variants
  button: {
    primary: {
      bg: "bg-gradient-to-r from-[#175a00] to-[#185900]",
      text: "text-white",
      hover: "hover:shadow-lg hover:shadow-green-200",
    },
    outline: {
      border: "border-[#175a00]",
      text: "text-[#175a00]",
      hover: "hover:bg-[#175a00] hover:text-white",
    },
  },

  // Status Colors
  status: {
    approved: {
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
      border: "border-emerald-500",
      text: "text-emerald-800",
      icon: "from-emerald-500 to-emerald-600",
    },
    pending: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
      border: "border-blue-500",
      text: "text-blue-800",
      icon: "from-blue-500 to-blue-600",
    },
    underReview: {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100/50",
      border: "border-amber-500",
      text: "text-amber-800",
      icon: "from-amber-500 to-amber-600",
    },
    rejected: {
      bg: "bg-gradient-to-br from-red-50 to-red-100/50",
      border: "border-red-500",
      text: "text-red-800",
      icon: "from-red-500 to-red-600",
    },
    documentRequired: {
      bg: "bg-gradient-to-br from-orange-50 to-orange-100/50",
      border: "border-orange-500",
      text: "text-orange-800",
      icon: "from-orange-500 to-orange-600",
    },
  },

  // Success/Error States
  states: {
    success: {
      bg: "bg-gradient-to-br from-[#175a00] to-[#185900]",
      shadow: "shadow-green-200",
    },
    error: {
      bg: "bg-gradient-to-br from-red-50 to-red-100/50",
      border: "border-red-300",
    },
  },
} as const;

// Helper function to get color value
export const getColor = (path: string): string => {
  const keys = path.split(".");
  let value: any = theme.colors;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) return "";
  }

  return value;
};
