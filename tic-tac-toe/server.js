const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

let games = {};

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on('joinGame', () => {
        const gameID = Math.random().toString(36).substr(2, 9);
        games[gameID] = { players: [socket], moves: Array(9).fill(null), currentPlayer: 0 };
        socket.join(gameID);
        socket.emit('gameJoined', { gameID });
    });

    socket.on('makeMove', ({ gameID, index }) => {
        const game = games[gameID];
        if (game && game.players[game.currentPlayer].id === socket.id && game.moves[index] === null) {
            game.moves[index] = game.currentPlayer;
            game.currentPlayer = 1 - game.currentPlayer;
            io.to(gameID).emit('updateBoard', { moves: game.moves });
        } else {
            socket.emit('error', 'Invalid Move');
        }
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        // Notify the opponent
        Object.keys(games).forEach(gameID => {
            const game = games[gameID];
            if (game.players.some(player => player.id === socket.id)) {
                io.to(gameID).emit('opponentDisconnected');
                delete games[gameID];
            }
        });
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
