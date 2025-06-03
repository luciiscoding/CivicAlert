/**
 * CivicAlert - Script pentru paginile de administrare
 * Funcționalități: gestionare probleme, utilizatori, restricții, etc.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Gestionare probleme
  const tableProbleme = document.querySelector('.table-probleme');
  
  if (tableProbleme) {
    // Schimbare status postare
    tableProbleme.querySelectorAll('.btn-change-status').forEach(button => {
      button.addEventListener('click', function() {
        const postareId = this.dataset.id;
        const newStatus = this.dataset.status;
        
        fetch(`/admin/postari/${postareId}/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({ status: newStatus })
        })
        .then(response => response.json())
        .then(data => {
          if (data.succes) {
            // Actualizare UI
            const statusCell = document.querySelector(`tr[data-id="${postareId}"] .status-badge`);
            
            // Eliminare clase vechi
            statusCell.classList.remove('status-waiting', 'status-working', 'status-resolved');
            
            // Adăugare clasă nouă și actualizare text
            if (newStatus === 'inAsteptare') {
              statusCell.classList.add('status-waiting');
              statusCell.textContent = 'În așteptare';
            } else if (newStatus === 'inLucru') {
              statusCell.classList.add('status-working');
              statusCell.textContent = 'În lucru';
            } else {
              statusCell.classList.add('status-resolved');
              statusCell.textContent = 'Rezolvat';
            }
            
            window.showToast('Status actualizat cu succes', 'success');
          } else {
            window.showToast('Eroare la actualizarea statusului', 'danger');
          }
        })
        .catch(error => {
          console.error('Eroare:', error);
          window.showToast('Eroare la actualizarea statusului', 'danger');
        });
      });
    });
    
    // Ștergere postare
    tableProbleme.querySelectorAll('.btn-delete-postare').forEach(button => {
      button.addEventListener('click', function() {
        if (confirm('Ești sigur că vrei să ștergi această postare? Această acțiune nu poate fi anulată.')) {
          const postareId = this.dataset.id;
          
          fetch(`/postari/${postareId}?_method=DELETE`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .then(response => {
            if (response.ok) {
              // Eliminare rând din tabel
              const row = document.querySelector(`tr[data-id="${postareId}"]`);
              if (row) {
                row.remove();
              }
              
              window.showToast('Postare ștearsă cu succes', 'success');
            } else {
              throw new Error('Eroare la ștergerea postării');
            }
          })
          .catch(error => {
            console.error('Eroare:', error);
            window.showToast('Eroare la ștergerea postării', 'danger');
          });
        }
      });
    });
  }
  
  // Gestionare utilizatori
  const tableUtilizatori = document.querySelector('.table-utilizatori');
  
  if (tableUtilizatori) {
    // Schimbare status utilizator
    tableUtilizatori.querySelectorAll('.btn-change-status').forEach(button => {
      button.addEventListener('click', function() {
        const userId = this.dataset.id;
        const newStatus = this.dataset.status;
        
        fetch(`/admin/utilizatori/${userId}/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({ status: newStatus })
        })
        .then(response => response.json())
        .then(data => {
          if (data.succes) {
            // Actualizare UI
            const statusCell = document.querySelector(`tr[data-id="${userId}"] .status-badge`);
            
            // Eliminare clase vechi
            statusCell.classList.remove('status-active', 'status-inactive', 'status-restricted');
            
            // Adăugare clasă nouă și actualizare text
            if (newStatus === 'activ') {
              statusCell.classList.add('status-active');
              statusCell.textContent = 'Activ';
            } else if (newStatus === 'inactiv') {
              statusCell.classList.add('status-inactive');
              statusCell.textContent = 'Inactiv';
            } else {
              statusCell.classList.add('status-restricted');
              statusCell.textContent = 'Restricționat';
            }
            
            window.showToast('Status utilizator actualizat cu succes', 'success');
          } else {
            window.showToast('Eroare la actualizarea statusului utilizatorului', 'danger');
          }
        })
        .catch(error => {
          console.error('Eroare:', error);
          window.showToast('Eroare la actualizarea statusului utilizatorului', 'danger');
        });
      });
    });
    
    // Adăugare restricție utilizator
    tableUtilizatori.querySelectorAll('.btn-add-restriction').forEach(button => {
      button.addEventListener('click', function() {
        const userId = this.dataset.id;
        const username = this.dataset.username;
        
        // Completare formular modal
        document.getElementById('userId').value = userId;
        document.getElementById('usernameDisplay').textContent = username;
        
        // Afișare modal
        const addRestrictionModal = new bootstrap.Modal(document.getElementById('addRestrictionModal'));
        addRestrictionModal.show();
      });
    });
  }
  
  // Salvare restricție
  const btnSaveRestriction = document.getElementById('btnSaveRestriction');
  
  if (btnSaveRestriction) {
    btnSaveRestriction.addEventListener('click', function() {
      const form = document.getElementById('formAddRestriction');
      
      // Verificare validare formular
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      
      const formData = {
        userId: document.getElementById('userId').value,
        tipRestrictie: document.getElementById('tipRestrictie').value,
        motivRestrictie: document.getElementById('motivRestrictie').value,
        zileRestrictie: document.getElementById('zileRestrictie').value
      };
      
      fetch('/admin/restrictii', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(formData)
      })
      .then(response => response.json())
      .then(data => {
        if (data.succes) {
          // Închidere modal
          const addRestrictionModal = bootstrap.Modal.getInstance(document.getElementById('addRestrictionModal'));
          addRestrictionModal.hide();
          
          // Adăugare restricție în tabel
          const tableRestrictii = document.querySelector('.table-restrictii tbody');
          
          if (tableRestrictii) {
            // Eliminare mesaj "Nu există restricții active" dacă există
            const noRestrictii = tableRestrictii.querySelector('tr td.text-center');
            if (noRestrictii && noRestrictii.textContent.includes('Nu există restricții active')) {
              noRestrictii.closest('tr').remove();
            }
            
            // Formatare date
            const dataRestrictie = new Date();
            const dataExpirare = new Date();
            dataExpirare.setDate(dataExpirare.getDate() + parseInt(formData.zileRestrictie));
            
            // Formatare tip restricție
            let tipRestrictieText = '';
            switch (formData.tipRestrictie) {
              case 'vizualizare':
                tipRestrictieText = 'Vizualizare';
                break;
              case 'postare':
                tipRestrictieText = 'Postare';
                break;
              case 'vot':
                tipRestrictieText = 'Votare';
                break;
              case 'comentariu':
                tipRestrictieText = 'Comentarii';
                break;
            }
            
            // Creare HTML pentru noua restricție
            const restrictieHtml = `
              <tr data-id="${data.restrictie._id}">
                <td>
                  <div class="d-flex align-items-center">
                    <img src="/uploads/profile/${data.restrictie.userId.pozaProfil}" alt="${data.restrictie.userId.username}" class="user-avatar">
                    <div class="ms-2">
                      ${data.restrictie.userId.username}
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge bg-warning">
                    ${tipRestrictieText}
                  </span>
                </td>
                <td>${formData.motivRestrictie}</td>
                <td>${dataRestrictie.toLocaleDateString('ro-RO')}</td>
                <td>${dataExpirare.toLocaleDateString('ro-RO')}</td>
                <td>
                  <button class="btn btn-sm btn-outline-danger btn-delete-restriction" data-id="${data.restrictie._id}" title="Șterge restricția">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            `;
            
            tableRestrictii.insertAdjacentHTML('afterbegin', restrictieHtml);
            
            // Adăugare event listener pentru butonul de ștergere
            const newDeleteButton = tableRestrictii.querySelector(`tr[data-id="${data.restrictie._id}"] .btn-delete-restriction`);
            if (newDeleteButton) {
              newDeleteButton.addEventListener('click', handleDeleteRestriction);
            }
            
            window.showToast('Restricție adăugată cu succes', 'success');
          } else {
            // Reîncărcare pagină dacă nu se poate actualiza UI direct
            window.location.reload();
          }
        } else {
          window.showToast('Eroare la adăugarea restricției: ' + data.mesaj, 'danger');
        }
      })
      .catch(error => {
        console.error('Eroare:', error);
        window.showToast('Eroare la adăugarea restricției', 'danger');
      });
    });
  }
  
  // Funcție pentru gestionare ștergere restricție
  const handleDeleteRestriction = function() {
    if (confirm('Ești sigur că vrei să ștergi această restricție? Utilizatorul va putea accesa din nou funcționalitatea restricționată.')) {
      const restrictieId = this.dataset.id;
      
      fetch(`/admin/restrictii/${restrictieId}?_method=DELETE`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.succes) {
          // Eliminare rând din tabel
          const row = document.querySelector(`tr[data-id="${restrictieId}"]`);
          if (row) {
            row.remove();
          }
          
          // Verificare dacă mai există restricții
          const tableRestrictii = document.querySelector('.table-restrictii tbody');
          
          if (tableRestrictii && tableRestrictii.children.length === 0) {
            tableRestrictii.innerHTML = `
              <tr>
                <td colspan="6" class="text-center">Nu există restricții active</td>
              </tr>
            `;
          }
          
          window.showToast('Restricție ștearsă cu succes', 'success');
        } else {
          window.showToast('Eroare la ștergerea restricției: ' + data.mesaj, 'danger');
        }
      })
      .catch(error => {
        console.error('Eroare:', error);
        window.showToast('Eroare la ștergerea restricției', 'danger');
      });
    }
  };
  
  // Adăugare event listener pentru butoanele de ștergere restricție
  document.querySelectorAll('.btn-delete-restriction').forEach(button => {
    button.addEventListener('click', handleDeleteRestriction);
  });
  
  // Filtrare utilizatori
  const btnAplicaFiltru = document.getElementById('btnAplicaFiltru');
  
  if (btnAplicaFiltru) {
    btnAplicaFiltru.addEventListener('click', function() {
      const searchText = document.getElementById('searchUtilizatori').value.toLowerCase();
      const statusFilter = document.getElementById('filtruStatus').value;
      const rolFilter = document.getElementById('filtruRol').value;
      
      document.querySelectorAll('.table-utilizatori tbody tr').forEach(row => {
        const username = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const email = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        const rol = row.querySelector('td:nth-child(5) .badge').textContent.toLowerCase();
        const status = row.querySelector('td:nth-child(6) .status-badge').textContent.toLowerCase();
        
        // Verificare text căutare
        const matchesSearch = searchText === '' || 
                             username.includes(searchText) || 
                             email.includes(searchText);
        
        // Verificare filtru status
        const matchesStatus = statusFilter === '' || 
                             status.toLowerCase() === statusFilter.toLowerCase();
        
        // Verificare filtru rol
        const matchesRol = rolFilter === '' || 
                          (rolFilter === 'admin' && rol.toLowerCase() === 'administrator') || 
                          (rolFilter === 'user' && rol.toLowerCase() === 'utilizator');
        
        // Afișare/ascundere rând
        if (matchesSearch && matchesStatus && matchesRol) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
  
  // Grafice pentru pagina de dashboard
  const activityChart = document.getElementById('activityChart');
  const statusChart = document.getElementById('statusChart');
  
  if (activityChart) {
    // Datele pentru grafic ar trebui să vină de la server
    // Aici sunt doar date de exemplu
    const ctxActivity = activityChart.getContext('2d');
    
    new Chart(ctxActivity, {
      type: 'line',
      data: {
        labels: ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie'],
        datasets: [
          {
            label: 'Probleme raportate',
            data: [65, 59, 80, 81, 56, 85],
            borderColor: '#483AA0',
            backgroundColor: 'rgba(72, 58, 160, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Probleme rezolvate',
            data: [28, 48, 40, 69, 36, 47],
            borderColor: '#7965C1',
            backgroundColor: 'rgba(121, 101, 193, 0.1)',
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  if (statusChart) {
    // Datele pentru grafic ar trebui să vină de la server
    // Aici sunt folosite variabile din EJS
    const ctxStatus = statusChart.getContext('2d');
    
    new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: ['În Așteptare', 'În Lucru', 'Rezolvate'],
        datasets: [{
          data: [
            document.querySelector('[data-asteptare]') ? parseInt(document.querySelector('[data-asteptare]').dataset.asteptare) : 0,
            document.querySelector('[data-lucru]') ? parseInt(document.querySelector('[data-lucru]').dataset.lucru) : 0,
            document.querySelector('[data-rezolvat]') ? parseInt(document.querySelector('[data-rezolvat]').dataset.rezolvat) : 0
          ],
          backgroundColor: [
            '#ff6b6b',
            '#feca57',
            '#1dd1a1'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
});