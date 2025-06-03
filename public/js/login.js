/**
 * CivicAlert - Script pentru paginile de login și register
 * Validare și efecte pentru formularele de autentificare
 */

document.addEventListener('DOMContentLoaded', function() {
  // Referințe formulare
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  // Salvare email în localStorage pentru "Ține-mă conectat"
  if (loginForm) {
    // Verificare dacă există email salvat
    const savedEmail = localStorage.getItem('rememberedEmail');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const emailField = document.getElementById('email');
    
    if (savedEmail && emailField) {
      emailField.value = savedEmail;
      if (rememberMeCheckbox) {
        rememberMeCheckbox.checked = true;
      }
    }
    
    // Salvare email la submit dacă "Ține-mă conectat" este bifat
    loginForm.addEventListener('submit', function() {
      if (rememberMeCheckbox && rememberMeCheckbox.checked && emailField.value) {
        localStorage.setItem('rememberedEmail', emailField.value);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
    });
  }
  
  // Validare suplimentară pentru formularul de înregistrare
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      let isValid = true;
      
      // Referințe câmpuri
      const username = document.getElementById('username');
      const email = document.getElementById('email');
      const parola = document.getElementById('parola');
      const confirmaParola = document.getElementById('confirmaParola');
      const acceptTermeni = document.getElementById('acceptTermeni');
      
      // Resetare mesaje eroare
      document.querySelectorAll('.invalid-feedback').forEach(el => {
        el.textContent = '';
      });
      
      // Validare username (minim 3 caractere)
      if (username.value.trim().length < 3) {
        document.getElementById('usernameError').textContent = 'Username-ul trebuie să aibă minim 3 caractere';
        username.classList.add('is-invalid');
        isValid = false;
      }
      
      // Validare email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value)) {
        document.getElementById('emailError').textContent = 'Adresa de email nu este validă';
        email.classList.add('is-invalid');
        isValid = false;
      }
      
      // Validare parolă (minim 6 caractere)
      if (parola.value.length < 6) {
        document.getElementById('parolaError').textContent = 'Parola trebuie să aibă minim 6 caractere';
        parola.classList.add('is-invalid');
        isValid = false;
      }
      
      // Validare confirmare parolă
      if (parola.value !== confirmaParola.value) {
        document.getElementById('confirmaParolaError').textContent = 'Parolele nu coincid';
        confirmaParola.classList.add('is-invalid');
        isValid = false;
      }
      
      // Validare termeni și condiții
      if (!acceptTermeni.checked) {
        acceptTermeni.classList.add('is-invalid');
        isValid = false;
      }
      
      // Prevenire trimitere formular dacă nu este valid
      if (!isValid) {
        e.preventDefault();
        
        // Animație shake pentru formular
        registerForm.classList.add('animate__animated', 'animate__shakeX');
        setTimeout(() => {
          registerForm.classList.remove('animate__animated', 'animate__shakeX');
        }, 1000);
      }
    });
    
    // Eliminare clasa is-invalid la input
    registerForm.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', function() {
        this.classList.remove('is-invalid');
      });
    });
    
    // Verificare complexitate parolă în timp real - VERSIUNE CORECTATĂ
    const parolaInput = document.getElementById('parola');
    if (parolaInput) {
      // Creează indicatorul o singură dată și îl poziționează fix
      const createPasswordStrengthIndicator = () => {
        let indicatorElement = document.getElementById('parolaStrength');
        
        if (!indicatorElement) {
          // Creează container-ul pentru indicator
          const passwordContainer = parolaInput.closest('.mb-3');
          
          // Creează indicatorul cu înălțime fixă
          indicatorElement = document.createElement('div');
          indicatorElement.id = 'parolaStrength';
          indicatorElement.classList.add('password-strength-indicator');
          
          // Stiluri inline pentru a preveni redimensionarea
          indicatorElement.style.cssText = `
            min-height: 20px;
            height: 20px;
            margin-top: 4px;
            font-size: 0.875rem;
            line-height: 1.2;
            display: flex;
            align-items: center;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          `;
          
          // Inserează indicatorul după input-group
          const inputGroup = passwordContainer.querySelector('.input-group');
          inputGroup.insertAdjacentElement('afterend', indicatorElement);
        }
        
        return indicatorElement;
      };
      
      // Inițializează indicatorul
      const strengthIndicator = createPasswordStrengthIndicator();
      
      parolaInput.addEventListener('input', function() {
        const parola = this.value;
        let mesaj = '';
        let clasa = '';
        let icon = '';
        
        // Verificare complexitate
        if (parola.length === 0) {
          mesaj = '';
          strengthIndicator.style.opacity = '0';
        } else {
          strengthIndicator.style.opacity = '1';
          
          if (parola.length < 6) {
            mesaj = '🔴 Parolă slabă';
            clasa = 'text-danger';
          } else if (parola.length < 8) {
            mesaj = '🟡 Parolă medie';
            clasa = 'text-warning';
          } else if (!/[A-Z]/.test(parola) || !/[0-9]/.test(parola)) {
            mesaj = '🟡 Adaugă literă mare și cifră';
            clasa = 'text-warning';
          } else {
            mesaj = '🟢 Parolă puternică';
            clasa = 'text-success';
          }
        }
        
        // Actualizare indicator fără a afecta layout-ul
        strengthIndicator.textContent = mesaj;
        strengthIndicator.className = 'password-strength-indicator';
        if (clasa) {
          strengthIndicator.classList.add(clasa);
        }
      });
      
      // Adaugă CSS pentru indicator în head
      const addPasswordStrengthStyles = () => {
        const existingStyle = document.getElementById('passwordStrengthStyles');
        if (existingStyle) return;
        
        const style = document.createElement('style');
        style.id = 'passwordStrengthStyles';
        style.textContent = `
          .password-strength-indicator {
            min-height: 20px !important;
            height: 20px !important;
            margin-top: 4px !important;
            font-size: 0.875rem !important;
            line-height: 1.2 !important;
            display: flex !important;
            align-items: center !important;
            transition: opacity 0.3s ease !important;
            position: relative !important;
            overflow: hidden !important;
            white-space: nowrap !important;
          }
          
          .password-strength-indicator.text-danger {
            color: #dc3545 !important;
          }
          
          .password-strength-indicator.text-warning {
            color: #ffc107 !important;
          }
          
          .password-strength-indicator.text-success {
            color: #198754 !important;
          }
          
          /* Previne redimensionarea input-group-urilor */
          .input-group {
            margin-bottom: 0 !important;
          }
          
          .mb-3 {
            margin-bottom: 1rem !important;
            min-height: auto !important;
          }
          
          /* Fix pentru a preveni layout shifts */
          .password-group {
            position: relative !important;
          }
          
          .password-group .form-control {
            flex: 1 1 auto !important;
            width: 1% !important;
            min-width: 0 !important;
          }
          
          .password-group .toggle-password {
            flex: 0 0 auto !important;
            width: auto !important;
            min-width: 44px !important;
          }
        `;
        document.head.appendChild(style);
      };
      
      // Adaugă stilurile
      addPasswordStrengthStyles();
    }
  }
  
  // Animație pentru cardurile de autentificare
  const authCard = document.querySelector('.auth-card');
  if (authCard) {
    // Adăugare efect de umbră și animație la hover
    authCard.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px)';
      this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
    });
    
    authCard.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
    });
  }
});