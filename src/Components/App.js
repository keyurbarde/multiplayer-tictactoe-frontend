import { useState } from "react";
import "../index.css";
import { JoinGame } from "./JoinGame";
import { CreateGame } from "./CreateGame";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [selection, setSelection] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [playerIdEntered, setPlayerIdEntered] = useState(false);

  function disconnect() {
    setSelection("");
  }

  function handlePlayerIdSubmit(e) {
    e.preventDefault();
    if (playerId.length < 3) {
      console.log("Must be at least 3 characters!");
      return;
    }

    setPlayerIdEntered(true);
  }

  function handlePlayerIdReset(e) {
    e.preventDefault();
    setPlayerIdEntered(false);
  }

  function handleJoinGameBack(e) {
    e.preventDefault();
    setSelection("");
  }

  return (
    <>
      <div className="game-container">
        {!selection && (
          <div className="init-menu">
            {!playerIdEntered ? (
              <motion.form
                key="init-menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ease: "easeOut", duration: 0.3 }}
                className="player-name-form"
                onSubmit={(e) => {
                  handlePlayerIdSubmit(e);
                }}>
                <h1>Enter Your Username</h1>
                <input
                  type="text"
                  onChange={(e) => setPlayerId(e.target.value)}></input>
                <button>Submit</button>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ scale: 2.4 }}
                transition={{ ease: "easeOut", duration: 0.3 }}>
                <div className="player-details">
                  <h1>
                    <span>Username: </span>
                    {playerId}
                  </h1>
                  <p onClick={(e) => handlePlayerIdReset(e)}>edit</p>
                </div>

                <div className="init-buttons">
                  <button onClick={() => setSelection("join")}>
                    Join Game
                  </button>
                  <button onClick={() => setSelection("create")}>
                    Create Game
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {selection === "join" ? (
          <JoinGame
            playerId={playerId}
            disconnect={disconnect}
            handleJoinGameBack={handleJoinGameBack}
          />
        ) : null}
        {selection === "create" ? (
          <CreateGame playerId={playerId} disconnect={disconnect} />
        ) : null}
      </div>
    </>
  );
}

export default App;
