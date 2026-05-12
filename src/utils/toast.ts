import { toast } from "sonner";

export const showSuccess = (message: string) => {
  toast.success(message, {
    position: "top-center",
    style: {
      background: "#10b981",
      color: "#fff",
      border: "none",
    },
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    position: "top-center",
    style: {
      background: "#ef4444",
      color: "#fff",
      border: "none",
    },
  });
};

export const showInfo = (message: string) => {
  toast.info(message, {
    position: "top-center",
  });
};

export const showWarning = (message: string) => {
  toast.warning(message, {
    position: "top-center",
  });
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};
