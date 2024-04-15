import { over } from "stompjs";
import SockJS from "sockjs-client";
import { useState } from "react";

function TestComponent() {
  const [game, setGame] = useState({
    gameId: "",
    player1: "",
    player2: "",
    gameStatus: "",
    board: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  });
  var stompClient = null;
  function connect() {
    let Sock = new SockJS("http://localhost:8080/ws");
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
  }

  function onError() {}

  function onConnected() {
    stompClient.subscribe(
      "/topic/game-progress/831a72fb-71ee-4130-ac94-8669c2b86291",
      onPlayerMove
    );
    playerMove(2, 2);
  }

  function onPlayerMove(payload) {
    console.log(JSON.parse(payload.body));
  }

  function playerMove(x, y) {
    var gameplay = {
      coordinateX: x,
      coordinateY: y,
      type: "O",
      gameId: "831a72fb-71ee-4130-ac94-8669c2b86291",
    };
    stompClient.send("/app/gameplay", {}, JSON.stringify(gameplay));
    console.log(JSON.stringify(gameplay));
  }

  connect();
  return (
    <>
      <h1>Hello</h1>
    </>
  );
}
export default TestComponent;
