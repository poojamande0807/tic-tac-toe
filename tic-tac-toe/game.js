const socket = io();
const board = document.getElementById('board');
let moves = Array(9).fill(null);

socket.on('gameJoined', ({ gameID }) => {
    console.log('Joined Game', gameID);
});

socket.on('updateBoard', ({ moves: newMoves }) => {
    moves = newMoves;
    updateBoard();
});

socket.on('opponentDisconnected', () => {
    alert('Opponent disconnected. You win!');
});

board.addEventListener('click', (e) => {
    const index = Array.from(board.children).indexOf(e.target);
    socket.emit('makeMove', { gameID: /* Current Game ID */, index });
});

function updateBoard() {
    board.innerHTML = '';
    moves.forEach((move, i) => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = move !== null ? (move === 0 ? 'X' : 'O') : '';
        board.appendChild(cell);
    });
}

document.getElementById('restart').addEventListener('click', () => {
    socket.emit('restartGame');
});
