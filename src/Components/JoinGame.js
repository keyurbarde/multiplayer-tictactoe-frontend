import Game from "./Game";
import { useState } from "react";
import "../index.css";
import { motion } from "framer-motion";

export function JoinGame({ playerId, disconnect, handleJoinGameBack }) {
  const [gameId, setGameId] = useState("");
  const [joined, setJoined] = useState(false);
  const [game, setGame] = useState(null);

  function handleJoinSubmit(e) {
    e.preventDefault();
    async function joinGame() {
      const response = await fetch("http://localhost:8080/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId: playerId,
          gameId: gameId,
        }),
      });
      const gameData = await response.json();
      console.log(gameData);
      setGame(gameData);

      if (response.ok) {
        setJoined(true);
      }
    }
    joinGame();
  }

  return (
    <>
      {!joined && (
        <motion.form
          className="join-game-form"
          onSubmit={handleJoinSubmit}
          key="join-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ease: "easeOut", duration: 0.3 }}>
          <svg
            onClick={(e) => handleJoinGameBack(e)}
            width="61"
            height="103"
            viewBox="0 0 61 103"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <rect
              x="0.713867"
              y="51.1982"
              width="72"
              height="12"
              rx="6"
              transform="rotate(-45 0.713867 51.1982)"
              fill="#EEEEEE"
            />
            <rect
              x="9.20703"
              y="42.7213"
              width="72"
              height="12"
              rx="6"
              transform="rotate(45 9.20703 42.7213)"
              fill="#EEEEEE"
            />
          </svg>

          <h1>Enter Invite Code</h1>
          <input
            type="text"
            onChange={(e) => setGameId(e.target.value)}></input>
          <button>Join</button>
        </motion.form>
      )}
      {joined && (
        <Game
          gameId={gameId}
          player1Id={game.player1Id}
          player2Id={playerId}
          type={"O"}
          disconnectProp={disconnect}
        />
      )}
    </>
  );
}
