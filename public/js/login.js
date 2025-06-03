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
    
    // Verificare complexitate parolă în timp real
    const parolaInput = document.getElementById('parola');
    if (parolaInput) {
      parolaInput.addEventListener('input', function() {
        const parola = this.value;
        let mesaj = '';
        let clasa = '';
        
        // Verificare complexitate
        if (parola.length === 0) {
          mesaj = '';
        } else if (parola.length < 6) {
          mesaj = 'Parolă slabă - Prea scurtă';
          clasa = 'text-danger';
        } else if (parola.length < 8) {
          mesaj = 'Parolă medie - Folosește minim 8 caractere';
          clasa = 'text-warning';
        } else if (!/[A-Z]/.test(parola) || !/[0-9]/.test(parola)) {
          mesaj = 'Parolă medie - Adaugă o literă mare și o cifră';
          clasa = 'text-warning';
        } else {
          mesaj = 'Parolă puternică';
          clasa = 'text-success';
        }
        
        // Afișare indicator complexitate
        let indicatorElement = document.getElementById('parolaStrength');
        
        if (!indicatorElement && mesaj) {
          indicatorElement = document.createElement('div');
          indicatorElement.id = 'parolaStrength';
          indicatorElement.classList.add('form-text', 'mt-1');
          parolaInput.parentNode.appendChild(indicatorElement);
        }
        
        if (indicatorElement) {
          indicatorElement.textContent = mesaj;
          indicatorElement.className = 'form-text mt-1';
          if (clasa) {
            indicatorElement.classList.add(clasa);
          }
        }
      });
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