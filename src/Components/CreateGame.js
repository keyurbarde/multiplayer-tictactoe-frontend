import Game from "./Game";
import { useState, useEffect } from "react";
import "../index.css";

export function CreateGame({ playerId, disconnect }) {
  const [isStarted, setIsStarted] = useState(false);
  const [game, setGame] = useState(null);

  useEffect(() => {
    async function createGame() {
      const response = await fetch("http://localhost:8080/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerId: playerId }),
      });

      if (response.ok) {
        const gameData = await response.json();
        console.log(gameData);
        setGame(gameData);
        setIsStarted(true);
      }
    }
    createGame();
  }, [playerId]);

  return (
    <>
      {isStarted ? (
        <>
          <Game
            gameId={game.gameId}
            player1Id={playerId}
            player2Id={game.player2Id}
            type={"X"}
            disconnectProp={disconnect}
          />
        </>
      ) : null}
    </>
  );
}
