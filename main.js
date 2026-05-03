document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Header offset
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Modal Logic
    const modal = document.getElementById('download-modal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalSpan = document.querySelector('.close-modal');

    if (openModalBtns.length > 0 && modal) {
        openModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.style.display = 'flex';
            });
        });
    }

    if (closeModalSpan && modal) {
        closeModalSpan.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Form submission handling for both forms
    const handleFormSubmit = (formId) => {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            console.log(`Form ${formId} Submitted:`, data);

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'ĐANG XỬ LÝ...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    alert('Đăng ký thành công! \nToàn bộ tài liệu sẽ được gửi qua Zalo/Email vừa đăng ký. Anh Chị vui lòng đợi ít phút và check nhé!');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    form.reset();
                    if (modal) modal.style.display = 'none';
                }, 1500);
            }
        });
    };

    handleFormSubmit('contact-form');
    handleFormSubmit('modal-contact-form');

    // Scroll effect for header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            } else {
                header.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
            }
        }
    });
});
