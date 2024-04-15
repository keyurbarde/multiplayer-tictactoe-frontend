import { useState, useEffect } from "react";
import "../index.css";
import { over } from "stompjs";
import SockJS from "sockjs-client";
import { motion, AnimatePresence } from "framer-motion";

let stompClient = null;
function Game({ gameId, player1Id, player2Id, type, disconnectProp }) {
  const p1 = player1Id;
  const [p2, setP2] = useState(player2Id);
  const thisPlayerId = type === "X" ? p1 : p2;
  const opponentPlayerId = type === "X" ? p2 : p1;

  const [turn, setTurn] = useState(type === "X" ? true : false);
  const [winner, setWinner] = useState();
  const [isTied, setIsTied] = useState(false);
  const [isResetRequestSent, setIsResetRequestSent] = useState(false);
  const [isResetRequestReceived, setIsResetRequestReceived] = useState(false);
  const [board, setBoard] = useState([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);
  const [winningCombination, setWinningCombination] = useState([]);

  useEffect(() => {
    let Sock = new SockJS("http://localhost:8080/ws");
    stompClient = over(Sock);
    stompClient.connect(
      { playerId: thisPlayerId, gameId: gameId },
      onConnected,
      onError
    );
  }, [thisPlayerId]);

  function onError() {
    console.log("Error In Connecting");
  }

  function onConnected() {
    stompClient.subscribe("/topic/game-progress/" + gameId, onPlayerMove);
    stompClient.subscribe(
      "/topic/player2connected/" + gameId,
      onPlayer2Connect
    );
    stompClient.subscribe("/topic/reset-request/" + gameId, onReset);
    stompClient.subscribe(
      "/topic/disconnect-check/" + gameId,
      onOpponentDisconnect
    );
  }

  function onOpponentDisconnect(payload) {
    if (thisPlayerId === p1) {
      setP2(null);
      setBoard([
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ]);
      setIsTied(false);
      setWinner(null);
      setTurn(type === "X" ? true : false);
      setIsResetRequestReceived(false);
      setIsResetRequestSent(false);
      setWinningCombination(null);
    } else {
      disconnect();
    }
  }

  function onReset(payload) {
    const parsedPayload = JSON.parse(payload.body);
    if (!parsedPayload.toReset) {
      if (parsedPayload.playerId !== thisPlayerId) {
        setIsResetRequestReceived(true);
      }
      return;
    }

    setBoard([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    setIsTied(false);
    setWinner(null);
    setTurn(type === "X" ? true : false);
    setWinningCombination(() => null);
    setIsResetRequestReceived(false);
    setIsResetRequestSent(false);
  }

  function reset() {
    if (isResetRequestSent) {
      return;
    }
    if (!isResetRequestReceived) {
      setIsResetRequestSent(true);
    }
    stompClient.send(
      "/app/reset-request",
      {},
      JSON.stringify({ playerId: thisPlayerId, gameId: gameId })
    );
  }

  function onPlayer2Connect(payload) {
    const parsedPayload = JSON.parse(payload.body);
    console.log(parsedPayload);
    setP2(parsedPayload.playerId);
  }

  function onPlayerMove(payload) {
    const parsedPayload = JSON.parse(payload.body);
    setBoard(parsedPayload.board);
    setTurn((turn) => !turn);
    if (parsedPayload.winner) {
      setWinner(parsedPayload.winner);
      setWinningCombination(checkWinningCombination(parsedPayload.board));
    } else {
      if (parsedPayload.status === "FINISHED") {
        setIsTied(true);
      }
    }

    console.log(parsedPayload.status);
  }

  function playerMove(x, y) {
    if (!turn || board[x][y] !== 0 || !p2 || winner) {
      return;
    }

    let gameplay = {
      coordinateX: x,
      coordinateY: y,
      type: type,
      gameId: gameId,
    };
    stompClient.send("/app/gameplay", {}, JSON.stringify(gameplay));
    console.log(JSON.stringify(gameplay));
  }

  function disconnect() {
    stompClient.disconnect();
    disconnectProp();
  }

  function isBoardFull(board) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === 0) {
          return false;
        }
      }
    }
    return true;
  }

  function checkWinningCombination(board) {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    console.log(board);
    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      console.log(a, b, c);

      const b1 = board[Math.floor(a / 3)][a % 3];
      const b2 = board[Math.floor(b / 3)][b % 3];
      const b3 = board[Math.floor(c / 3)][c % 3];

      if (b1 !== 0 && b1 === b2 && b2 === b3) {
        return [a, b, c];
      }
    }

    return null;
  }

  return (
    <motion.div
      className="game"
      key="game"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ ease: "easeOut", duration: 0.3 }}>
      <h1 className="game-top-text">
        {p1 && p2
          ? winner
            ? winner === thisPlayerId
              ? "You Win"
              : "You Lose"
            : isTied
            ? "It's a Tie"
            : turn
            ? "Your turn"
            : "Opponent's turn"
          : `Invite Code : ${gameId}`}
      </h1>

      <div
        className={
          "board " +
          (!turn && !isBoardFull(board) && !winner ? "reduce-opacity " : "")
        }>
        {board.map((row, rowIndex) =>
          row.map((val, colIndex) => (
            <Tile
              key={`${rowIndex}${colIndex}`}
              handleOnClick={() => playerMove(rowIndex, colIndex)}
              val={val}
              type={
                board[rowIndex][colIndex] === 0 && turn && !winner ? type : null
              }
              highlight={
                winningCombination &&
                winningCombination.includes(rowIndex * 3 + colIndex)
                  ? winner === player1Id
                    ? "blue"
                    : "red"
                  : null
              }
            />
          ))
        )}
      </div>

      <div className="players">
        <div className="p1-box" f>
          <p>{p1}</p>
          <svg
            width="57"
            height="57"
            viewBox="0 0 57 57"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <rect
              x="0.410156"
              y="50.9117"
              width="72"
              height="8"
              rx="4"
              transform="rotate(-45 0.410156 50.9117)"
              fill="#333"
            />
            <rect
              x="5.65723"
              y="0.192566"
              width="72"
              height="8"
              rx="4"
              transform="rotate(45 5.65723 0.192566)"
              fill="#333"
            />
          </svg>
        </div>
        <div className="p2-box">
          <svg
            width="60"
            height="60"
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="30" r="26" stroke="#333" stroke-width="8" />
          </svg>

          <p>{p2 ? p2 : "Yet to join"}</p>
        </div>
      </div>
      <div className={"game-buttons"}>
        <button
          className={
            "disconnect " +
            (winner || isBoardFull(board) ? "disconnect-full" : "")
          }
          onClick={() => disconnect()}>
          Disconnect
        </button>

        {winner || isBoardFull(board) ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: "easeOut", duration: 1 }}
            className={
              "reset " +
              (isResetRequestSent ? "reset-request-sent " : "") +
              (isResetRequestReceived ? "reset-request-received" : "")
            }
            onClick={() => reset()}>
            {isResetRequestSent ? "Request Sent" : "Play Again"}
          </motion.button>
        ) : null}
      </div>

      {isResetRequestReceived ? (
        <motion.h2
          key={"hello"}
          className="play-again-text"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "100%" }}
          exit={{ opacity: 0, height: 0 }}>
          {opponentPlayerId} wants to play again
        </motion.h2>
      ) : null}
    </motion.div>
  );
}

function Tile({ handleOnClick, val, type, highlight }) {
  const tileClass = type ? (type === "X" ? "type-X" : "type-O") : "";
  const highlightClass = highlight ? "tile-highlight-" + highlight : "";

  return (
    <div
      className={`board-tile ${tileClass} ${highlightClass}`}
      onClick={handleOnClick}>
      <AnimatePresence>
        {val === 2 && (
          <motion.svg
            key="O"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: "easeOut", duration: 0.2 }}
            width="60"
            height="60"
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="30" r="26" stroke="#FF7D7D" stroke-width="8" />
          </motion.svg>
        )}
        {val === 1 && (
          <motion.svg
            key="X"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: "easeOut", duration: 0.2 }}
            width="57"
            height="57"
            viewBox="0 0 57 57"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <rect
              x="0.410156"
              y="50.9117"
              width="72"
              height="8"
              rx="4"
              transform="rotate(-45 0.410156 50.9117)"
              fill="#7ED8FF"
            />
            <rect
              x="5.65723"
              y="0.192566"
              width="72"
              height="8"
              rx="4"
              transform="rotate(45 5.65723 0.192566)"
              fill="#7ED8FF"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Game;
