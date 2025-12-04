import React from "react";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  size = "md",
  message,
  fullScreen = false,
  overlay = false,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const messageSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Building Icon with Animation */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full animate-pulse"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main building structure */}
          <g className="building">
            {/* Building base */}
            <rect
              x="30"
              y="40"
              width="40"
              height="55"
              fill="#175a00"
              className="animate-building-grow"
            />

            {/* Roof */}
            <polygon
              points="28,40 50,25 72,40"
              fill="#185900"
              className="animate-building-grow-delayed"
            />

            {/* Windows - Row 1 */}
            <rect
              x="38"
              y="48"
              width="6"
              height="7"
              fill="#FFF"
              className="animate-window-1"
              opacity="0.9"
            />
            <rect
              x="56"
              y="48"
              width="6"
              height="7"
              fill="#FFF"
              className="animate-window-2"
              opacity="0.9"
            />

            {/* Windows - Row 2 */}
            <rect
              x="38"
              y="60"
              width="6"
              height="7"
              fill="#FFF"
              className="animate-window-3"
              opacity="0.9"
            />
            <rect
              x="56"
              y="60"
              width="6"
              height="7"
              fill="#FFF"
              className="animate-window-4"
              opacity="0.9"
            />

            {/* Windows - Row 3 */}
            <rect
              x="38"
              y="72"
              width="6"
              height="7"
              fill="#FFF"
              className="animate-window-1"
              opacity="0.9"
            />
            <rect
              x="56"
              y="72"
              width="6"
              height="7"
              fill="#FFF"
              className="animate-window-2"
              opacity="0.9"
            />

            {/* Door */}
            <rect
              x="44"
              y="82"
              width="12"
              height="13"
              fill="#0d3300"
              className="animate-building-grow"
            />
            <circle cx="47" cy="88" r="0.8" fill="#FFF" />
          </g>
        </svg>
      </div>

      {/* Loading message */}
      {message && (
        <p
          className={`${messageSizeClasses[size]} text-slate-700 font-medium animate-pulse`}
        >
          {message}
        </p>
      )}

      {/* Loading dots */}
      <div className="flex gap-2">
        <div
          className="w-2 h-2 bg-green-700 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-green-700 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-green-700 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {loaderContent}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {loaderContent}
        </div>
      </div>
    );
  }

  return loaderContent;
};

// Inline loader for buttons and small spaces
export const InlineLoader: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

// Building loader specifically for property/society context
export const BuildingLoader: React.FC<{
  message?: string;
  size?: "sm" | "md" | "lg";
}> = ({ message = "Processing...", size = "md" }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <Loader size={size} message={message} />
    </div>
  );
};
