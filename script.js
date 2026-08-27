const form = document.querySelector('#medical-form');
const comments = document.querySelector('#comentarios');
const characterCount = document.querySelector('#character-count');
const statusMessage = document.querySelector('#form-status');

comments.addEventListener('input', () => {
  characterCount.textContent = comments.value.length;
});

form.addEventListener('reset', () => {
  characterCount.textContent = '0';
  statusMessage.classList.remove('visible');
  statusMessage.textContent = '';
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  statusMessage.classList.remove('visible');

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  statusMessage.textContent = 'La ficha médica se ha guardado correctamente.';
  statusMessage.classList.add('visible');
  statusMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
