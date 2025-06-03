/**
 * CivicAlert - Script principal
 * Conține funcționalități generale pentru tot site-ul
 */

// Inițializare AOS (Animate on Scroll)
document.addEventListener('DOMContentLoaded', function() {
  // Inițializare AOS
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    mirror: false
  });
  
  // Navbar sticky la scroll
  const navbar = document.getElementById('mainNav');
  
  if (navbar) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        navbar.classList.add('navbar-shrink');
      } else {
        navbar.classList.remove('navbar-shrink');
      }
    });
  }
  
  // Smooth scroll pentru link-uri anchor
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Animație contor pentru numere mari (statistici)
  const counterElements = document.querySelectorAll('.counter');
  
  if (counterElements.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const countTo = parseInt(target.innerText);
          let count = 0;
          const time = 2000;
          const increment = countTo / (time / 30);
          
          const updateCounter = () => {
            count += increment;
            if (count < countTo) {
              target.innerText = Math.ceil(count);
              setTimeout(updateCounter, 30);
            } else {
              target.innerText = countTo;
            }
          };
          
          updateCounter();
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.5 });
    
    counterElements.forEach(counter => {
      observer.observe(counter);
    });
  }
  
  // Toast-uri pentru mesaje (success, error, etc.)
  const showToast = (message, type = 'info') => {
    // Verificare container toast-uri
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    // Creare toast
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
      <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header bg-${type} text-white">
          <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 5000 });
    toast.show();
    
    // Eliminare toast după închidere
    toastElement.addEventListener('hidden.bs.toast', function() {
      toastElement.remove();
    });
  };
  
  // Adăugare funcție la window pentru a fi accesibilă global
  window.showToast = showToast;
  
  // Verificare pentru mesaje de succes/eroare în URL
  const urlParams = new URLSearchParams(window.location.search);
  const successMessage = urlParams.get('succes');
  const errorMessage = urlParams.get('error');
  
  if (successMessage) {
    showToast(decodeURIComponent(successMessage), 'success');
  }
  
  if (errorMessage) {
    showToast(decodeURIComponent(errorMessage), 'danger');
  }
  
  // Toggle Password Visibility pentru câmpurile de parolă
  const togglePasswordButtons = document.querySelectorAll('.toggle-password');
  
  togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
      const passwordField = this.parentElement.querySelector('input');
      const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordField.setAttribute('type', type);
      
      // Schimbare icon
      const icon = this.querySelector('i');
      if (type === 'text') {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
  
  // Validare generală pentru formulare
  const validateForm = (form) => {
    let isValid = true;
    
    // Validare câmpuri required
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        field.classList.add('is-invalid');
        isValid = false;
      } else {
        field.classList.remove('is-invalid');
      }
    });
    
    // Validare email
    form.querySelectorAll('input[type="email"]').forEach(field => {
      if (field.value && !isValidEmail(field.value)) {
        field.classList.add('is-invalid');
        isValid = false;
      }
    });
    
    return isValid;
  };
  
  // Funcție pentru validare email
  const isValidEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  // Adăugare validare la toate formularele
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!validateForm(this)) {
        e.preventDefault();
        showToast('Verifică formularul și încearcă din nou.', 'danger');
      }
    });
    
    // Reset validare la schimbare valori
    form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('input', function() {
        this.classList.remove('is-invalid');
      });
    });
  });
});