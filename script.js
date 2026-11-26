const board = document.getElementById('board');
const puzzle = document.getElementById('puzzle');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const feedback = document.getElementById('feedback');
const timer = document.getElementById('timer');
const resetButton = document.getElementById('resetButton');
const successDialog = document.getElementById('successDialog');
const finalTime = document.getElementById('finalTime');
const playAgainButton = document.getElementById('playAgainButton');

let draggedPiece = null;
let selectedPiece = null;
let placedCount = 0;
let elapsed = 0;
let intervalId = null;

const positions = [[0,0],[33.333,0],[66.666,0],[0,33.333],[33.333,33.333],[66.666,33.333],[0,66.666],[33.333,66.666],[66.666,66.666]];

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`;
}
function startTimer() {
  if (intervalId) return;
  intervalId = setInterval(() => { elapsed++; timer.textContent = formatTime(elapsed); }, 1000);
}
function stopTimer() { clearInterval(intervalId); intervalId = null; }
function setFeedback(message, type='') {
  feedback.className = `feedback ${type}`.trim();
  feedback.querySelector('span').textContent = type === 'success' ? '✓' : type === 'error' ? '⚠' : '💡';
  feedback.querySelector('p').innerHTML = message;
}
function shuffle(array) {
  const copy = [...array];
  for (let i=copy.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; }
  return copy;
}
function clearSelection() {
  document.querySelectorAll('.piece').forEach(piece => piece.classList.remove('selected'));
  selectedPiece = null;
}
function placePiece(piece,target) {
  if (!piece || target.classList.contains('correct')) return;
  if (piece.dataset.position === target.dataset.position) {
    const position = Number(piece.dataset.position);
    target.classList.add('correct');
    target.style.backgroundPosition = `${positions[position][0]}% ${positions[position][1]}%`;
    piece.classList.add('placed'); piece.draggable=false; piece.setAttribute('aria-disabled','true');
    placedCount++;
    progressText.textContent = `${placedCount} de 9 colocadas`;
    progressBar.style.width = `${placedCount/9*100}%`;
    clearSelection();
    setFeedback('<strong>¡Correcto!</strong> La sección encaja en su posición original.','success');
    if (placedCount===9) {
      stopTimer(); finalTime.textContent=formatTime(elapsed);
      setFeedback(`<strong>¡Imagen reconstruida!</strong> Completaste el puzzle en ${formatTime(elapsed)}.`,'success');
      setTimeout(() => successDialog.showModal?.(),350);
    }
  } else {
    target.classList.add('wrong');
    setFeedback('<strong>Posición incorrecta.</strong> Observa el color, el texto o el dibujo de la sección.','error');
    setTimeout(() => target.classList.remove('wrong'),400);
  }
}
function createGame() {
  board.innerHTML=''; puzzle.innerHTML='';
  for (let i=0;i<9;i++) {
    const target=document.createElement('button');
    target.type='button'; target.className='target'; target.dataset.position=i;
    target.setAttribute('aria-label',`Posición ${i+1}`); target.innerHTML=`<span aria-hidden="true">${i+1}</span>`;
    target.addEventListener('dragenter',event=>{event.preventDefault(); if(!target.classList.contains('correct'))target.classList.add('drag-over');});
    target.addEventListener('dragover',event=>{event.preventDefault(); event.dataTransfer.dropEffect='move';});
    target.addEventListener('dragleave',()=>target.classList.remove('drag-over'));
    target.addEventListener('drop',event=>{event.preventDefault();target.classList.remove('drag-over');if(draggedPiece)placePiece(draggedPiece,target);});
    target.addEventListener('click',()=>{if(selectedPiece)placePiece(selectedPiece,target);});
    puzzle.appendChild(target);

    const piece=document.createElement('button');
    piece.type='button';piece.className='piece';piece.dataset.position=i;piece.draggable=true;
    piece.setAttribute('aria-label',`Sección de imagen ${i+1}`);
    piece.style.backgroundPosition=`${positions[i][0]}% ${positions[i][1]}%`;
    piece.addEventListener('dragstart',event=>{startTimer();draggedPiece=piece;piece.classList.add('dragging');event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',piece.dataset.position);});
    piece.addEventListener('dragend',()=>{piece.classList.remove('dragging');draggedPiece=null;});
    piece.addEventListener('click',()=>{if(piece.classList.contains('placed'))return;startTimer();if(selectedPiece===piece){clearSelection();setFeedback('Selección cancelada. Elige una sección y después su posición.','');return;}clearSelection();selectedPiece=piece;piece.classList.add('selected');setFeedback('Sección seleccionada. Ahora elige su posición en el tablero.','');});
    board.appendChild(piece);
  }
  shuffle([...board.children]).forEach(piece=>board.appendChild(piece));
}
function resetGame() {
  stopTimer();elapsed=0;placedCount=0;timer.textContent='00:00';progressText.textContent='0 de 9 colocadas';progressBar.style.width='0';clearSelection();
  setFeedback('<strong>Instrucción:</strong> arrastra una porción de la imagen al espacio coincidente.','');
  if(successDialog.open)successDialog.close();createGame();
}
resetButton.addEventListener('click',resetGame);playAgainButton.addEventListener('click',resetGame);createGame();
