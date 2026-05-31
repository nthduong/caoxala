document.addEventListener("DOMContentLoaded", () => {
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxYWq_ykp23ZogVO2i6-VWo2Nt5J82sR_orAMRbNd9Y3b6e1pYLtfKJiehskgQdqkOz/exec";

  // --- Smooth scrolling ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerOffset = 80;
        const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    });
  });

  // --- Modal Logic ---
  const modal = document.getElementById("download-modal");
  const openModalBtns = document.querySelectorAll(".open-modal-btn");
  const closeModalSpan = document.querySelector(".close-modal");

  openModalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      modal.style.display = "flex";
    });
  });

  if (closeModalSpan) {
    closeModalSpan.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // --- Form submission ---
  const handleFormSubmit = (formId) => {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      submitBtn.textContent = "ĐANG XỬ LÝ...";
      submitBtn.disabled = true;

      // Dùng URLSearchParams thay FormData để tránh CORS preflight
      const params = new URLSearchParams(new FormData(form));

      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          body: params,
          // KHÔNG set Content-Type thủ công — trình duyệt tự gán đúng
        });

        // Google Script redirect 302 là bình thường, không cần check res.ok
        alert("Đăng ký thành công!\nTài liệu sẽ được gửi qua Zalo của bạn.");
        form.reset();
        if (modal) modal.style.display = "none";
      } catch (error) {
        // Chỉ vào đây khi mất mạng hoàn toàn
        console.error("Lỗi gửi form:", error);
        alert("Không thể kết nối. Vui lòng kiểm tra mạng và thử lại!");
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  };

  handleFormSubmit("contact-form");
  handleFormSubmit("modal-contact-form");

  // --- Scroll effect for header ---
  window.addEventListener("scroll", () => {
    const header = document.querySelector(".header");
    if (header) {
      header.style.boxShadow = window.scrollY > 50 ? "0 5px 15px rgba(0,0,0,0.1)" : "0 2px 5px rgba(0,0,0,0.05)";
    }
  });
});
