/**
 * CivicAlert - Script pentru paginile de feed și detalii postare
 * Funcționalități: filtrare, sortare, votare, comentarii, etc.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Referințe elemente DOM
  const listaPostari = document.getElementById('listaPostari');
  const cautareInput = document.getElementById('cautareProbleme');
  const filtruStatus = document.getElementById('filtruStatus');
  const sortareSelect = document.getElementById('sortareProbleme');
  const btnVot = document.getElementById('btnVot');
  const formComentariu = document.getElementById('formComentariu');
  
  // Funcția pentru filtrare postări în pagina de feed
  const filtreazaPostari = () => {
    if (!listaPostari || !cautareInput || !filtruStatus || !sortareSelect) return;
    
    const textCautare = cautareInput.value.toLowerCase();
    const statusFiltru = filtruStatus.value;
    const carduri = listaPostari.querySelectorAll('.postare-card');
    
    carduri.forEach(card => {
      const titlu = card.querySelector('.postare-title').textContent.toLowerCase();
      const descriere = card.querySelector('.postare-desc').textContent.toLowerCase();
      const autor = card.querySelector('.postare-autor span').textContent.toLowerCase();
      const status = card.classList.contains('status-asteptare') ? 'inAsteptare' :
                    card.classList.contains('status-lucru') ? 'inLucru' :
                    'rezolvat';
      
      // Verificare text căutare
      const potrivireCautare = titlu.includes(textCautare) || 
                              descriere.includes(textCautare) || 
                              autor.includes(textCautare);
      
      // Verificare filtru status
      const potrivireStatus = statusFiltru === 'toate' || statusFiltru === status;
      
      // Afișare/ascundere card
      const colContainer = card.closest('.col-md-6, .col-lg-4');
      if (colContainer) {
        if (potrivireCautare && potrivireStatus) {
          colContainer.style.display = '';
        } else {
          colContainer.style.display = 'none';
        }
      }
    });
    
    // Verificare dacă există postări vizibile
    const postariVizibile = listaPostari.querySelectorAll('.col-md-6[style=""], .col-lg-4[style=""]');
    const noResults = document.querySelector('.no-results');
    
    if (postariVizibile.length === 0 && !noResults) {
      const noResultsHtml = `
        <div class="col-12 text-center mt-5">
          <div class="no-results">
            <i class="fas fa-search"></i>
            <h3>Nicio problemă găsită</h3>
            <p>Încearcă să modifici criteriile de căutare</p>
          </div>
        </div>
      `;
      listaPostari.insertAdjacentHTML('beforeend', noResultsHtml);
    } else if (postariVizibile.length > 0 && noResults) {
      noResults.remove();
    }
  };
  
  // Funcția pentru sortare postări
  const sorteazaPostari = () => {
    if (!listaPostari || !sortareSelect) return;
    
    const optiuneSortare = sortareSelect.value;
    const containerPostari = listaPostari;
    const carduri = Array.from(containerPostari.querySelectorAll('.col-md-6, .col-lg-4'));
    
    // Sortare carduri în funcție de opțiunea selectată
    carduri.sort((a, b) => {
      const cardA = a.querySelector('.postare-card');
      const cardB = b.querySelector('.postare-card');
      
      if (optiuneSortare === 'dataDesc') {
        // Sortare după dată (cele mai recente)
        const dataA = cardA.querySelector('.postare-date').textContent;
        const dataB = cardB.querySelector('.postare-date').textContent;
        return new Date(dataB) - new Date(dataA);
      } else if (optiuneSortare === 'dataAsc') {
        // Sortare după dată (cele mai vechi)
        const dataA = cardA.querySelector('.postare-date').textContent;
        const dataB = cardB.querySelector('.postare-date').textContent;
        return new Date(dataA) - new Date(dataB);
      } else if (optiuneSortare === 'voturiDesc') {
        // Sortare după număr voturi
        const voturiA = parseInt(cardA.querySelector('.postare-voturi').textContent.trim().match(/\d+/)[0]);
        const voturiB = parseInt(cardB.querySelector('.postare-voturi').textContent.trim().match(/\d+/)[0]);
        return voturiB - voturiA;
      } else if (optiuneSortare === 'comentariiDesc') {
        // Sortare după număr comentarii
        const comentariiA = parseInt(cardA.querySelector('.postare-comentarii').textContent.trim().match(/\d+/)[0]);
        const comentariiB = parseInt(cardB.querySelector('.postare-comentarii').textContent.trim().match(/\d+/)[0]);
        return comentariiB - comentariiA;
      }
      
      return 0;
    });
    
    // Reordonare carduri în DOM
    carduri.forEach(card => {
      containerPostari.appendChild(card);
    });
  };
  
  // Inițializare filtrare și sortare
  if (cautareInput) {
    cautareInput.addEventListener('input', filtreazaPostari);
  }
  
  if (filtruStatus) {
    filtruStatus.addEventListener('change', filtreazaPostari);
  }
  
  if (sortareSelect) {
    sortareSelect.addEventListener('change', sorteazaPostari);
  }
  
  // Funcționalitate votare postare
  if (btnVot) {
    btnVot.addEventListener('click', function() {
      const postareId = this.dataset.id;
      
      fetch(`/postari/${postareId}/vot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.succes) {
          // Actualizare număr voturi
          const numarVoturi = document.getElementById('numarVoturi');
          if (numarVoturi) {
            numarVoturi.textContent = data.numarVoturi;
          }
          
          // Actualizare aspect buton
          if (data.aVotat) {
            btnVot.classList.add('votat');
          } else {
            btnVot.classList.remove('votat');
          }
        } else {
          window.showToast('Eroare la procesarea votului', 'danger');
        }
      })
      .catch(error => {
        console.error('Eroare:', error);
        window.showToast('Eroare la procesarea votului', 'danger');
      });
    });
  }
  
  // Funcționalitate buton vot în feed
  document.querySelectorAll('.btn-vot').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const postareId = this.dataset.id;
      
      fetch(`/postari/${postareId}/vot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.succes) {
          // Actualizare număr voturi în card
          const card = this.closest('.postare-card');
          const numarVoturiElement = card.querySelector('.postare-voturi');
          
          if (numarVoturiElement) {
            numarVoturiElement.innerHTML = `<i class="fas fa-thumbs-up"></i> ${data.numarVoturi}`;
          }
          
          // Actualizare aspect buton
          if (data.aVotat) {
            this.classList.add('votat');
          } else {
            this.classList.remove('votat');
          }
        } else {
          window.showToast('Eroare la procesarea votului', 'danger');
        }
      })
      .catch(error => {
        console.error('Eroare:', error);
        window.showToast('Eroare la procesarea votului', 'danger');
      });
    });
  });
  
  // Gestionare comentarii
  if (formComentariu) {
    formComentariu.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const postareId = this.action.split('/').pop();
      const textComentariu = this.querySelector('textarea').value;
      
      if (!textComentariu.trim()) {
        window.showToast('Comentariul nu poate fi gol', 'warning');
        return;
      }
      
      fetch(this.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ text: textComentariu })
      })
      .then(response => response.json())
      .then(data => {
        if (data.succes) {
          // Resetare formular
          this.reset();
          
          // Eliminare mesaj "Niciun comentariu încă"
          const noComentarii = document.getElementById('noComentarii');
          if (noComentarii) {
            noComentarii.remove();
          }
          
          // Formatare dată
          const dataComentariu = new Date(data.comentariu.dataComentariu);
          const optiuniFormatare = { year: 'numeric', month: 'short', day: 'numeric' };
          const dataFormatata = dataComentariu.toLocaleDateString('ro-RO', optiuniFormatare);
          
          // Creare HTML pentru noul comentariu
          const comentariuHtml = `
            <div class="comentariu-item" id="comentariu-${data.comentariu._id}">
              <div class="comentariu-header">
                <div class="comentariu-autor">
                  <img src="/uploads/profile/${data.comentariu.autorId.pozaProfil}" alt="${data.comentariu.autorId.username}">
                  <div>
                    <p class="autor-name">${data.comentariu.autorId.username}</p>
                    <p class="comentariu-date">${dataFormatata}</p>
                  </div>
                </div>
                
                <div class="comentariu-actions">
                  <div class="dropdown">
                    <button class="btn btn-sm btn-link dropdown-toggle" type="button" 
                            data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                      <li>
                        <button class="dropdown-item btn-editeaza-comentariu" 
                                data-id="${data.comentariu._id}" 
                                data-text="${data.comentariu.text}">
                          <i class="fas fa-edit"></i> Editează
                        </button>
                      </li>
                      <li>
                        <button class="dropdown-item text-danger btn-sterge-comentariu" 
                                data-id="${data.comentariu._id}">
                          <i class="fas fa-trash-alt"></i> Șterge
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div class="comentariu-text">
                <p>${data.comentariu.text}</p>
              </div>
            </div>
          `;
          
          // Adăugare comentariu în listă
          const listaComentarii = document.getElementById('listaComentarii');
          listaComentarii.insertAdjacentHTML('afterbegin', comentariuHtml);
          
          // Adăugare eventListener pentru butoanele de editare/ștergere
          adaugaEventListenerComentarii();
          
          // Actualizare număr comentarii
          const titluComentarii = document.querySelector('.comentarii-section h3');
          if (titluComentarii) {
            const numarComentarii = listaComentarii.querySelectorAll('.comentariu-item').length;
            titluComentarii.textContent = `Comentarii (${numarComentarii})`;
          }
          
          window.showToast('Comentariu adăugat cu succes', 'success');
        } else {
          window.showToast('Eroare la adăugarea comentariului', 'danger');
        }
      })
      .catch(error => {
        console.error('Eroare:', error);
        window.showToast('Eroare la adăugarea comentariului', 'danger');
      });
    });
  }
  
  // Funcție pentru adăugare eventListener-uri butoane comentarii
  const adaugaEventListenerComentarii = () => {
    // Butoane editare comentarii
    document.querySelectorAll('.btn-editeaza-comentariu').forEach(button => {
      button.addEventListener('click', function() {
        const comentariuId = this.dataset.id;
        const textComentariu = this.dataset.text;
        
        // Completare formular modal
        document.getElementById('comentariuId').value = comentariuId;
        document.getElementById('textComentariu').value = textComentariu;
        
        // Afișare modal
        const editModal = new bootstrap.Modal(document.getElementById('editComentariuModal'));
        editModal.show();
      });
    });
    
    // Butoane ștergere comentarii
    document.querySelectorAll('.btn-sterge-comentariu').forEach(button => {
      button.addEventListener('click', function() {
        if (confirm('Ești sigur că vrei să ștergi acest comentariu?')) {
          const comentariuId = this.dataset.id;
          
          fetch(`/comentarii/${comentariuId}?_method=DELETE`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          })
          .then(response => response.json())
          .then(data => {
            if (data.succes) {
              // Eliminare comentariu din DOM
              const comentariuElement = document.getElementById(`comentariu-${comentariuId}`);
              if (comentariuElement) {
                comentariuElement.remove();
              }
              
              // Actualizare număr comentarii
              const listaComentarii = document.getElementById('listaComentarii');
              const titluComentarii = document.querySelector('.comentarii-section h3');
              
              if (titluComentarii) {
                const numarComentarii = listaComentarii.querySelectorAll('.comentariu-item').length;
                titluComentarii.textContent = `Comentarii (${numarComentarii})`;
                
                // Afișare mesaj "Niciun comentariu încă" dacă nu mai există comentarii
                if (numarComentarii === 0) {
                  const noComentariiHtml = `
                    <div class="no-comentarii" id="noComentarii">
                      <i class="far fa-comment-dots"></i>
                      <p>Niciun comentariu încă</p>
                    </div>
                  `;
                  listaComentarii.innerHTML = noComentariiHtml;
                }
              }
              
              window.showToast('Comentariu șters cu succes', 'success');
            } else {
              window.showToast('Eroare la ștergerea comentariului', 'danger');
            }
          })
          .catch(error => {
            console.error('Eroare:', error);
            window.showToast('Eroare la ștergerea comentariului', 'danger');
          });
        }
      });
    });
  };
  
  // Inițializare eventListener-uri comentarii
  adaugaEventListenerComentarii();
  
  // Salvare comentariu editat
  const btnSalveazaComentariu = document.getElementById('btnSalveazaComentariu');
  if (btnSalveazaComentariu) {
    btnSalveazaComentariu.addEventListener('click', function() {
      const comentariuId = document.getElementById('comentariuId').value;
      const textComentariu = document.getElementById('textComentariu').value;
      
      if (!textComentariu.trim()) {
        window.showToast('Comentariul nu poate fi gol', 'warning');
        return;
      }
      
      fetch(`/comentarii/${comentariuId}?_method=PUT`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ text: textComentariu })
      })
      .then(response => response.json())
      .then(data => {
        if (data.succes) {
          // Actualizare text comentariu în DOM
          const comentariuElement = document.getElementById(`comentariu-${comentariuId}`);
          if (comentariuElement) {
            const textElement = comentariuElement.querySelector('.comentariu-text p');
            if (textElement) {
              textElement.textContent = textComentariu;
            }
            
            // Actualizare dataset pentru butonul de editare
            const btnEditare = comentariuElement.querySelector('.btn-editeaza-comentariu');
            if (btnEditare) {
              btnEditare.dataset.text = textComentariu;
            }
          }
          
          // Închidere modal
          const editModal = bootstrap.Modal.getInstance(document.getElementById('editComentariuModal'));
          editModal.hide();
          
          window.showToast('Comentariu actualizat cu succes', 'success');
        } else {
          window.showToast('Eroare la actualizarea comentariului', 'danger');
        }
      })
      .catch(error => {
        console.error('Eroare:', error);
        window.showToast('Eroare la actualizarea comentariului', 'danger');
      });
    });
  }
  
  // Preview imagini pentru pagina de creare/editare postare
  const inputImagini = document.getElementById('imagini');
  const previewContainer = document.getElementById('imagePreviewContainer');
  
  if (inputImagini && previewContainer) {
    inputImagini.addEventListener('change', function() {
      previewContainer.innerHTML = '';
      
      if (this.files.length > 5) {
        window.showToast('Poți încărca maxim 5 imagini', 'warning');
        this.value = '';
        return;
      }
      
      for (const file of this.files) {
        if (!file.type.startsWith('image/')) {
          continue;
        }
        
        const reader = new FileReader();
        const col = document.createElement('div');
        col.className = 'col-4';
        
        const previewCard = document.createElement('div');
        previewCard.className = 'preview-card';
        
        const img = document.createElement('img');
        img.className = 'img-fluid';
        
        reader.onload = function(e) {
          img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
        
        previewCard.appendChild(img);
        col.appendChild(previewCard);
        previewContainer.appendChild(col);
      }
    });
  }
  
  // Validare formular creare/editare postare
  const formCrearePostare = document.getElementById('formCrearePostare');
  
  if (formCrearePostare) {
    formCrearePostare.addEventListener('submit', function(e) {
      const lat = document.getElementById('lat').value;
      const lng = document.getElementById('lng').value;
      
      if (!lat || !lng) {
        e.preventDefault();
        window.showToast('Te rugăm să selectezi locația pe hartă', 'warning');
      } else {
        // Afișare loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
          loadingOverlay.classList.remove('d-none');
        }
      }
    });
  }
});