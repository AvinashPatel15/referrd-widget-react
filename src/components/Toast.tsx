import React from "react";

interface ToastProps {
  message: string;
  type?: "default" | "success" | "error" | "warning";
}

const Toast = ({ message, type = "default" }: ToastProps) => {
  const toastStyle = {
    padding: "6px 15px",
    fontSize: "16px",
    borderRadius: "5px",
    display: "flex",
    gap: "6px",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.3s ease-in-out",
  };

  const typeStyles: Record<string, React.CSSProperties> = {
    default: { backgroundColor: "#00b5ff" },
    success: { backgroundColor: "#00a96e" },
    error: { backgroundColor: "#e74c3c" },
    warning: { backgroundColor: "#f1c40f" },
  };

  const toastClassName = `toast ${type}`;

  return (
    <div
      style={{ ...toastStyle, ...(typeStyles[type] || {}) }}
      className={toastClassName}
    >
      {type === "success" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-check-circle-2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ) : type === "error" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-x-circle"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </svg>
      ) : type === "warning" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-alert-triangle"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-info"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      )}
      <p>{message}</p>
    </div>
  );
};

export default Toast;
