document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  const main = document.getElementsByClassName("areaOfGame")[0];
  const plateau = document.getElementsByClassName("plateau")[0];
  let playerName;
  let playerID;
  let playerHand = [];
  let gameID = 0;
  let socket = io();

  socket.on("connect", function() {
      requestNickname();

      socket.on("nicknameConfirmed", function({id}) {
          playerID = id;
      });

      socket.on("nicknameAllreadyTaken", function() {
          requestNickname("Nickname allready taken in this game");
      });

      socket.on("waitingForPlayer", function() {
          creatingWaiting();
      });

      socket.on("newGame", function (data) {
          removeWaiting();
          newGame(data);
      });

      socket.on("waitingOpponentPlaying", function() {
          creatingWaiting();
      });

      socket.on("opponentPlayed", function({player, opponent}) {
          removeWaiting();
          let cardPlayerPlayed = createElements("img", null, {
              name: "src",
              value: player.image
          }, "cardPlayer");
          let cardOpponentPlayed = createElements("img", null, {
              name: "src",
              value: opponent.image
          }, "cardOpponent");
          cardPlayerPlayed.className = "played";
          let areaOfGame = document.getElementsByClassName("areaOfGame")[0];

          if(document.getElementsByClassName("preview")[0] != undefined) {
              document.getElementsByClassName("preview")[0].remove();
          }

          areaOfGame.appendChild(cardPlayerPlayed);
          areaOfGame.insertBefore(cardOpponentPlayed, document.getElementsByClassName("cardOpponent")[0]);

          document.getElementsByClassName("handOpponent")[0].getElementsByTagName("img")[0].remove();

          outcome();
      });

      socket.on("outcome", function({result, score, next}) {
          outcomeCallback(result, score, next);
      });

      socket.on("okForNextTurn", function() {
          removeWaiting();
          let hand = document.getElementsByClassName("handplayer")[0].getElementsByClassName("card");
          for (let element of hand) {
              element.getElementsByTagName("img")[0].addEventListener("click", eventPreviewingOneCard);
          }
          draw(1, playerID);
      });

      socket.on("finalOutcome", function({result, score, next}) {
          outcomeCallback(result, score, next);
      });

      socket.on("enOfGame", function({winOrLoose, wannaReplay}) {
          let plateau = document.getElementsByClassName("areaOfGame")[0];
          let h1 = createElements("h1", winOrLoose, null, "description");
          let replay = createElements("p", wannaReplay, null, "description");
          let yesOption = createElements("p", "Oui", null, "description");
          let noOption = createElements("p", "Non", null, "description");
          yesOption.addEventListener("click", nextGame);
          noOption.addEventListener("click", theEnd);
          plateau.appendChild(h1);
          plateau.appendChild(replay);
          plateau.appendChild(yesOption);
          plateau.appendChild(noOption);
      });

      socket.on("opponentDeconnection", function() {
          clearTable();
          clearHand();
          let plateau = document.getElementsByClassName("areaOfGame")[0];
          let disconnected = createElements("h1", "Votre adversaire s'est déconnecté, voulez-vous rejouer ?", null, "description");
          let optionYes = createElements("p", "oui", null, "description");
          let optionNo = createElements("p", "non", null, "description");
          optionYes.addEventListener("click", startNewGameCauseDeconnection);
          optionNo.addEventListener("click", theEnd);
          plateau.appendChild(disconnected);
          plateau.appendChild(optionYes);
          plateau.appendChild(optionNo);
      });
  });

  function requestNickname(message = "Welcome new player, please enter your nickname :") {
      playerName = "";
      while(playerName == null || playerName == "") {
          playerName = prompt(message);
      }
      socket.emit("playerName", playerName);
  }

  function creatingWaiting() {
      let waitingImage = createElements("img", null, {name: "src", value: "images/waiting.gif"}, "waiting");
      main.appendChild(waitingImage);
  }

  function removeWaiting() {
      let waitingImage = main.getElementsByClassName("waiting")[0];
      if(waitingImage != null || waitingImage != undefined) {
          waitingImage.remove();
      }
  }

  function outcomeCallback(result, score, next) {
      let areaOfGame = document.getElementsByClassName("areaOfGame")[0];
      let article = createElements("article", result, null, "description");
      let nextElement = createElements("p", next, null);
      nextElement.className = next;
      nextElement.addEventListener("click", next == "Tour suivant" ? nextTurn : endOfGame);
      let action = createElements("article", null, null, "description nexTurn");
      action.appendChild(nextElement);
      let playerScore = document.getElementsByClassName("playerScore")[0];
      let newPlayerScore = createElements("p", score.player, null);
      let opponentScore = document.getElementsByClassName("opponentScore")[0];
      let newOpponentScore = createElements("p", score.opponent, null);
      playerScore.replaceChild(newPlayerScore, playerScore.getElementsByTagName("p")[0]);
      opponentScore.replaceChild(newOpponentScore, opponentScore.getElementsByTagName("p")[0]);
      areaOfGame.appendChild(article);
      areaOfGame.appendChild(action);
  }

  function clearTable() {
      let children = document.getElementsByClassName("areaOfGame")[0].childNodes.length;
      for (let i = 0; i < children; i++) {
          document.getElementsByClassName("areaOfGame")[0].childNodes[0].remove();
      }
  }

  function clearHand() {
      let hand = document.getElementsByClassName("handplayer")[0].childNodes.length;
      for(let i = 0; i < hand; i++) {
          document.getElementsByClassName("handplayer")[0].childNodes[0].remove();
      }
  }

  function newGame(data) {
    document.getElementsByClassName("plateau")[0].replaceWith(plateau);
    document.getElementsByClassName("playerScore")[0].getElementsByTagName("p")[0].innerHTML = "0";
    document.getElementsByClassName("opponentScore")[0].getElementsByTagName("p")[0].innerHTML = "0";
    document.getElementsByClassName("playerScore")[0].getElementsByTagName("h1")[0].innerHTML = data.player1.nickName;
    document.getElementsByClassName("opponentScore")[0].getElementsByTagName("h1")[0].innerHTML = data.player2.nickName;
    document.getElementsByClassName("cimetiere")[0].getElementsByTagName("p")[0].addEventListener("click", graveyard);
    gameID = data.game_id;
    draw(3, playerID);

  }

  function draw(number, id) {
      let jsonBody = JSON.stringify(
          {
              "quantity": number,
              "id": id
          }
      );

    requests("POST", `http://localhost:3000/game/${gameID}/draw`, jsonBody)

      .then(response => {
        let handPlayer = document.getElementsByClassName("handplayer")[0];
        let handOpponent = document.getElementsByClassName("handOpponent")[0];
        let pioche = document.getElementsByClassName("pioche")[0].getElementsByTagName("p")[0];
        let effectPlayer = document.getElementsByClassName("playerEffect")[0].getElementsByTagName("p")[0];
        let effectOpponent = document.getElementsByClassName("opponentEffect")[0].getElementsByTagName("p")[0];
        response.cards.forEach(function (element) {
          let article = createElements("article", null, null, "card");
          let image = createElements("img", null, {
            name: "src",
            value: element.image
          });
          image.id = element.code;
          article.appendChild(image);
          handPlayer.appendChild(article);
          handOpponent.appendChild(createElements("img", null, {
              name: "src",
              value: "./images/verso_carte.jpg"
            }));
          image.addEventListener("click", eventPreviewingOneCard, false);
          playerHand.push(
                {
                    "cardDescription": element.cardDescription,
                    "hashCode": element.code
                }
            );
        }, this);
        pioche.innerHTML = `Cartes restantes ${response.remaining}`;
        effectPlayer.innerHTML = response.player;
        effectOpponent.innerHTML = response.opponent;
      });
  }

  function createElements(tag, content, attribute, nameClass = "") {
    let element = document.createElement(`${tag}`);

    if (content) {
      element.innerHTML = content;
    }

    if (attribute) {
      element.setAttribute(attribute.name, attribute.value);
    }

    element.className = nameClass;
    return element;
  }

  function requests(method, url, body, parse = true) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      xhr.onload = function () {
        (this.status >= 200 && this.status < 300) ? resolve(parse ? JSON.parse(xhr.response) : xhr.response): reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      body == null ? xhr.send() : xhr.send(body);
    });
  }

  function eventPreviewingOneCard() {
      let preview = document.getElementsByClassName("preview");
      if(preview.length == 0) {
          this.parentNode.className = "preview";
          let hand = document.getElementsByClassName("card");
          let currentDescription;
          for (let element of playerHand) {
              if (element.hashCode == this.id) {
                  currentDescription = element.cardDescription;
              }
          }
          let description = createElements("article", `<p>${currentDescription.description}</p><p>${currentDescription.power_weakness}</p>`, null, "description");
          let disablePreview = createElements("p", currentDescription.action1, null, "disablePreview");
          let playCard = createElements("p", currentDescription.action2, null, "play");
          let allAction = createElements("article", null, null, "action");
          disablePreview.addEventListener("click", eventClosePreviewingOneCard);
          playCard.addEventListener("click", eventPlayOneCard);
          allAction.appendChild(disablePreview);
          allAction.appendChild(playCard);
          this.parentNode.appendChild(description);
          this.parentNode.appendChild(allAction);
      }
  }

  function eventClosePreviewingOneCard() {
      this.parentNode.parentNode.className = "card";
      this.removeEventListener("click", eventClosePreviewingOneCard);
      document.getElementsByClassName("action")[0].remove();
      document.getElementsByClassName("description")[0].remove();
  }

  function eventPlayOneCard() {
      let that = this;
      let cardCode = document.getElementsByClassName("preview")[0].getElementsByTagName("img")[0].id;
      let jsonBody = JSON.stringify(
          {
              "hashCode": cardCode,
              "id": playerID
          }
      );

      let areaOfGame = document.getElementsByClassName("areaOfGame")[0];
      let cardsArticle = document.getElementsByClassName("card");
      that.parentNode.getElementsByClassName("disablePreview")[0].removeEventListener("click", eventClosePreviewingOneCard);
      that.removeEventListener("click", eventPlayOneCard);
      document.getElementsByClassName("preview")[0].remove();
      for(let article of cardsArticle) {
          let currentArticle = article.getElementsByTagName("img");
          currentArticle[0].removeEventListener("click", eventPreviewingOneCard);
      }
      requests("POST", `http://localhost:3000/game/${gameID}/play`, jsonBody, false);
  }

  function outcome() {
    let results = {
      result: "",
      opponentScore: "",
      nextTurn: ""
    };
    socket.emit("outcomeWanted", {gameID, playerID});
  }

  function nextTurn() {
      document.getElementsByClassName("nexTurn")[0].removeEventListener("click", nextTurn);
      let children = document.getElementsByClassName("areaOfGame")[0].childNodes.length;
      for (let i = 0; i < children; i++) {
          document.getElementsByClassName("areaOfGame")[0].childNodes[0].remove();
      }
      creatingWaiting();
      socket.emit("nextTurnWanted", {gameID: gameID, playerID: playerID});
  }
  
  function graveyard() {
    let cimetiere = document.getElementsByClassName("cimetiere")[0].getElementsByTagName("p")[0];
    let discard = document.getElementsByClassName("discard");
    if(document.getElementsByClassName("preview").length == 0) {
      if(discard.length != 0) {
        cimetiere.innerHTML = "Cliquez ici pour voir la défausse";
        discard[0].remove();
      } else {
        cimetiere.innerHTML = "Cliquez ici pour fermer la défausse";

        requests("POST", `http://localhost:3000/game/${gameID}/graveyard`)

        .then((response) => {
          let figure = createElements("article", null, null, "discard");
          for (let i = 0; i < response.cards.length; i++) {
            figure.appendChild(createElements("img", null, {
              name: "src",
              value: response.cards[i].image
            }));
          }
          document.getElementsByClassName("cimetiere")[0].appendChild(figure);
        })
      }
    }
  }

  function endOfGame() {
    document.getElementsByClassName("cimetiere")[0].getElementsByTagName("p")[0].removeEventListener("click", graveyard);
      clearTable();
      let jsonBody = JSON.stringify(
          {
              "id": playerID
          }
      );
    requests("POST", `http://localhost:3000/game/${gameID}/winner`, jsonBody, false);
  }

  function nextGame() {
    this.removeEventListener("click", nextGame);
    for(let i = 0; i < 4; i++) {
      document.getElementsByClassName("areaOfGame")[0].children[0].remove();
    }
    socket.emit("playerName", playerName);
  }

  function theEnd() {
    this.removeEventListener("click", theEnd);
    for(let i = 0; i < 4; i++) {
      document.getElementsByClassName("areaOfGame")[0].children[0].remove();
    }
    let thanksMessage = createElements("h1", "Merci d'avoir joué !! N'hésitez pas à me faire part de vos remarques constructives !", null);
    document.getElementsByClassName("areaOfGame")[0].appendChild(thanksMessage);
  }

  function startNewGameCauseDeconnection() {
      clearTable();
      socket.emit("playerName", playerName);
  }
});