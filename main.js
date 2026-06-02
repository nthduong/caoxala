document.addEventListener("DOMContentLoaded", () => {
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxr_aHp9TPPDTIGCVJkncCwo1xGMWVhVCs-8tE9mBqpcTSHmRR61qn_FnuklGgT_R1Z/exec";

  // --- Security: Rate Limiting & Validation ---
  const SUBMIT_INTERVAL = 5000;
  const lastSubmitTime = {};

  const validatePhone = (phone) => {
    // Vietnamese phone: +84 hoặc 0, sau đó 9-10 chữ số
    const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validateFullname = (name) => {
    const trimmed = name.trim();
    return trimmed.length >= 1 && trimmed.length <= 100;
  };

  const isHoneypotFilled = (form) => {
    const honeypot = form.querySelector('input[name="website"]');
    return honeypot && honeypot.value.length > 0;
  };

  const canSubmitForm = (formId) => {
    const now = Date.now();
    const lastTime = lastSubmitTime[formId] || 0;

    if (now - lastTime < SUBMIT_INTERVAL) {
      const remainingTime = Math.ceil((SUBMIT_INTERVAL - (now - lastTime)) / 1000);
      alert(`Vui lòng đợi ${remainingTime} giây trước khi gửi tiếp`);
      return false;
    }

    return true;
  };

  const recordSubmitTime = (formId) => {
    lastSubmitTime[formId] = Date.now();
  };

  const sendRequest = async (params) => {
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: params,
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      // Nếu HTTP status 200, coi như gửi thành công (không cần kiểm tra response text)
      console.log("Data sent successfully to Google Sheet");
      return true;
    } catch (error) {
      console.error("sendRequest failed:", error);
      return false;
    }
  };

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
      if (!modal) return;
      modal.style.display = "flex";
      // accessibility: focus first input in modal
      const firstInput = modal.querySelector('input[name="fullname"]') || modal.querySelector("input");
      if (firstInput) firstInput.focus();
    });
  });

  if (closeModalSpan) {
    closeModalSpan.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (modal && e.target === modal) modal.style.display = "none";
  });

  // close modal on Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.style.display === "flex") {
      modal.style.display = "none";
    }
  });

  // --- Form submission ---
  const handleFormSubmit = (formId) => {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Check honeypot (bot detection)
      if (isHoneypotFilled(form)) {
        console.warn("🚨 Honeypot detected - likely bot submission");
        alert("Có lỗi xảy ra, vui lòng thử lại.");
        form.reset();
        if (modal) modal.style.display = "none";
        return;
      }

      // Get form data
      const fullnameEl = form.querySelector('input[name="fullname"]');
      const phoneEl = form.querySelector('input[name="phone"]');

      if (!fullnameEl || !phoneEl) {
        console.error("Form is missing required inputs", { formId });
        alert("Có lỗi trong form. Vui lòng tải lại trang và thử lại.");
        return;
      }

      const fullname = fullnameEl.value.trim();
      const phone = phoneEl.value.trim();

      // Validate inputs
      if (!validateFullname(fullname)) {
        alert("Họ và tên phải từ 2-100 ký tự");
        return;
      }

      if (!validatePhone(phone)) {
        alert("Số điện thoại không hợp lệ.");
        return;
      }

      // Rate limiting check
      if (!canSubmitForm(formId)) {
        return;
      }

      recordSubmitTime(formId);

      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : "";

      if (submitBtn) {
        submitBtn.textContent = "ĐANG XỬ LÝ...";
        submitBtn.disabled = true;
      }

      const params = new URLSearchParams(new FormData(form));
      const success = await sendRequest(params);

      if (success) {
        alert("Đăng ký thành công!\nTài liệu sẽ được gửi qua Zalo của bạn.");
        form.reset();
        if (modal) modal.style.display = "none";
      } else {
        alert("Gửi thất bại, vui lòng thử lại.");
      }

      if (submitBtn) {
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
