import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const popupClass = {
  container: "z-[10000]",
  popup: "rounded-2xl bg-[#140616] text-white shadow-[0_30px_90px_rgba(0,0,0,0.45)]",
  title: "text-[#f4e7fb]",
  htmlContainer: "text-white/70",
  confirmButton: "rounded-xl bg-champagne px-6 py-3 font-black text-ink outline-none",
  cancelButton: "rounded-xl bg-white/10 px-6 py-3 font-black text-white outline-none",
};

function showAlert(icon: "success" | "error" | "warning" | "info", title: string, text: string) {
  return Swal.fire({
    icon,
    title,
    text,
    background: "#140616",
    color: "#ffffff",
    confirmButtonText: "OK",
    buttonsStyling: false,
    customClass: popupClass,
    didOpen: () => {
      const container = Swal.getContainer();

      if (container) {
        container.style.zIndex = "10000";
      }
    },
  });
}

export function showSuccessAlert(title: string, text: string) {
  return showAlert("success", title, text);
}

export function showErrorAlert(title: string, text: string) {
  return showAlert("error", title, text);
}

export function showInfoAlert(title: string, text: string) {
  return showAlert("info", title, text);
}

export function showConfirmAlert(title: string, text: string, confirmButtonText = "Confirm") {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    background: "#140616",
    color: "#ffffff",
    confirmButtonText,
    cancelButtonText: "Cancel",
    showCancelButton: true,
    reverseButtons: true,
    buttonsStyling: false,
    customClass: popupClass,
    didOpen: () => {
      const container = Swal.getContainer();

      if (container) {
        container.style.zIndex = "10000";
      }
    },
  });
}
