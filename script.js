const form = document.querySelector('#medical-form');
const comments = document.querySelector('#comentarios');
const characterCount = document.querySelector('#character-count');
const statusMessage = document.querySelector('#form-status');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-apellido');
const searchResults = document.querySelector('#search-results');
const creatorView = document.querySelector('#creator-view');
const searchView = document.querySelector('#search-view');
const openSearchButton = document.querySelector('#open-search');
const closeCreatorButton = document.querySelector('#close-creator');
const closeSearchButton = document.querySelector('#close-search');
const rutInput = document.querySelector('#rut');
const phoneInput = document.querySelector('#telefono');
const emailInput = document.querySelector('#email');
const storageKey = 'fichas-medicas';

const formatRut = (value) => {
  const cleanValue = value.replace(/[^0-9kK]/g, '').toUpperCase();
  const verifier = cleanValue.slice(-1);
  const digits = cleanValue.slice(0, -1).slice(0, 8);

  if (!digits) return verifier === 'K' ? '' : verifier;
  const groupedDigits = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${groupedDigits}-${verifier}`;
};

rutInput.addEventListener('input', () => {
  rutInput.value = formatRut(rutInput.value);
});

phoneInput.addEventListener('input', () => {
  phoneInput.value = phoneInput.value.replace(/[^0-9+ ()-]/g, '');
  if (phoneInput.value && !phoneInput.value.startsWith('+')) {
    phoneInput.value = `+${phoneInput.value.replace(/\+/g, '')}`;
  }
});

emailInput.addEventListener('input', () => {
  emailInput.value = emailInput.value.replace(/\s/g, '');
});

const showView = (view) => {
  const isSearchView = view === 'search';
  creatorView.hidden = isSearchView;
  searchView.hidden = !isSearchView;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (isSearchView) {
    searchInput.focus();
  }
};

const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const normalizeRut = (value) => normalizeText(value).replace(/[^0-9k]/g, '');

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const getRecords = () => {
  try {
    const records = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(records) ? records : [];
  } catch (error) {
    return [];
  }
};

const saveRecords = (records) => localStorage.setItem(storageKey, JSON.stringify(records));

const showStatus = (message) => {
  statusMessage.textContent = message;
  statusMessage.classList.add('visible');
  statusMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

const renderSearchResults = (records, query) => {
  if (!query) {
    searchResults.innerHTML = '';
    return;
  }

  const matches = records.filter((record) => normalizeText(record.apellidos).includes(normalizeText(query)));
  searchResults.innerHTML = matches.length
    ? matches.map((record) => `<article class="result-item"><strong>${escapeHtml(record.nombres)} ${escapeHtml(record.apellidos)}</strong><span>RUT ${escapeHtml(record.rut)} · ${escapeHtml(record.ciudad)}</span></article>`).join('')
    : '<p class="empty-results">No encontramos fichas con ese apellido.</p>';
};

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

  const record = Object.fromEntries(new FormData(form).entries());
  const records = getRecords();
  const existingIndex = records.findIndex((savedRecord) => normalizeRut(savedRecord.rut) === normalizeRut(record.rut));

  if (existingIndex !== -1 && !window.confirm('Ya existe una ficha con este RUT. ¿Deseas sobrescribirla?')) {
    showStatus('No se realizaron cambios en la ficha.');
    return;
  }

  if (existingIndex === -1) {
    records.push(record);
  } else {
    records[existingIndex] = record;
  }

  saveRecords(records);
  showStatus(existingIndex === -1
    ? 'La ficha médica se ha guardado correctamente.'
    : 'La ficha médica existente se ha sobrescrito correctamente.');
});

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  renderSearchResults(getRecords(), searchInput.value);
});

openSearchButton.addEventListener('click', () => showView('search'));
closeCreatorButton.addEventListener('click', () => showView('search'));
closeSearchButton.addEventListener('click', () => showView('creator'));
