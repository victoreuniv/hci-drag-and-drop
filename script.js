const pieces = [...document.querySelectorAll('.piece')];
const targets = [...document.querySelectorAll('.target')];
const piecesContainer = document.getElementById('pieces');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const feedback = document.getElementById('feedback');
const resetButton = document.getElementById('resetButton');
const timer = document.getElementById('timer');
const successDialog = document.getElementById('successDialog');
const finalTime = document.getElementById('finalTime');
const playAgainButton = document.getElementById('playAgainButton');

let draggedPiece = null;
let selectedPiece = null;
let placedCount = 0;
let elapsed = 0;
let intervalId = null;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}

function startTimer() {
  if (intervalId) return;
  intervalId = setInterval(() => {
    elapsed += 1;
    timer.textContent = formatTime(elapsed);
  }, 1000);
}

function stopTimer() {
  clearInterval(intervalId);
  intervalId = null;
}

function setFeedback(message, type = '') {
  feedback.className = `feedback ${type}`.trim();
  const icon = type === 'success' ? '✓' : type === 'error' ? '⚠' : '💡';
  feedback.querySelector('.feedback-icon').textContent = icon;
  feedback.querySelector('p').innerHTML = message;
}

function updateProgress() {
  progressText.textContent = `${placedCount} de 3 colocadas`;
  progressBar.style.width = `${(placedCount / 3) * 100}%`;
}

function clearSelection() {
  pieces.forEach(piece => piece.classList.remove('selected'));
  selectedPiece = null;
}

function placePiece(piece, target) {
  if (!piece || target.classList.contains('correct')) return;

  if (piece.dataset.piece === target.dataset.target) {
    target.classList.remove('wrong');
    target.classList.add('correct');
    target.querySelector('span').textContent = piece.dataset.piece;
    piece.classList.add('placed');
    piece.setAttribute('aria-disabled', 'true');
    piece.draggable = false;
    placedCount += 1;
    updateProgress();
    clearSelection();
    setFeedback(`<strong>¡Correcto!</strong> La pieza ${piece.dataset.piece} ocupa la posición ${target.dataset.target}.`, 'success');

    if (placedCount === 3) completePuzzle();
  } else {
    target.classList.add('wrong');
    setFeedback(`<strong>Posición incorrecta.</strong> Prueba la pieza ${piece.dataset.piece} en otro destino.`, 'error');
    setTimeout(() => target.classList.remove('wrong'), 400);
  }
}

function completePuzzle() {
  stopTimer();
  setFeedback(`<strong>¡Actividad completada!</strong> Organizaste las tres piezas en ${formatTime(elapsed)}.`, 'success');
  finalTime.textContent = formatTime(elapsed);
  setTimeout(() => {
    if (typeof successDialog.showModal === 'function') successDialog.showModal();
  }, 350);
}

pieces.forEach(piece => {
  piece.addEventListener('dragstart', event => {
    startTimer();
    draggedPiece = piece;
    piece.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', piece.dataset.piece);
  });

  piece.addEventListener('dragend', () => {
    piece.classList.remove('dragging');
    draggedPiece = null;
  });

  piece.addEventListener('click', () => {
    if (piece.classList.contains('placed')) return;
    startTimer();
    if (selectedPiece === piece) {
      clearSelection();
      setFeedback('Selección cancelada. Elige una pieza y después una posición.', '');
      return;
    }
    clearSelection();
    selectedPiece = piece;
    piece.classList.add('selected');
    setFeedback(`Pieza ${piece.dataset.piece} seleccionada. Ahora elige su posición.`, '');
  });
});

targets.forEach(target => {
  target.addEventListener('dragenter', event => {
    event.preventPreventDefault();
    if (!target.classList.contains('correct')) target.classList.add('drag-over');
  });

  target.addEventListener('dragover', event => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  });

  target.addEventListener('dragleave', () => target.classList.remove('drag-over'));

  target.addEventListener('drop', event => {
    event.preventDefault();
    target.classList.remove('drag-over');
    if (draggedPiece) placePiece(draggedPiece, target);
  });

  target.addEventListener('click', () => {
    if (selectedPiece) placePiece(selectedPiece, target);
  });
});

function resetGame() {
  stopTimer();
  elapsed = 0;
  placedCount = 0;
  timer.textContent = '00:00';
  clearSelection();

  pieces.forEach((piece, index) => {
    piece.classList.remove('placed', 'selected', 'dragging');
    piece.setAttribute('aria-disabled', 'false');
    piece.draggable = true;
    piecesContainer.appendChild(piece);
  });

  targets.forEach(target => {
    target.classList.remove('correct', 'wrong', 'drag-over');
    target.queryState = '';
    target.querySelector('span').textContent = target.dataset.target;
  });

  updateProgress();
  setFeedback('<strong>Comprueba tu interacción:</strong> selecciona una pieza y arrástrala hasta su número equivalente.', '');
  if (successDialog.open) successDialog.close();
}

resetButton.addEventListener('click', resetGame);
playAgainButton.addEventListener('click', resetGame);

updateProgress();
