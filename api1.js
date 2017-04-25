(function() {
        'use strict';

        let express = require("express");
        let bodyParser = require("body-parser");
        let app = express();
        let server = require("http").Server(app);
        let router = express.Router();
        let io = require("socket.io").listen(server);

        let Game = require("./public/classes/Game");
        let fullDeck = require("./fullDeck").fullDeck;
        let manageGames = new (require("./public/classes/ManageGames").ManageGames);

        app.use(express.static("public"));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));

        router.param('serial', function (request, result, next, serial) {
            if (serial > manageGames.getNumberOfGames()) {
                console.log(`Partie numéro ${serial} non trouvée !`);
                result.status(404).send('Game not found');
            } else {
                request.serial = serial;
                if (request.body) {
                    request.currentGame = manageGames.getGameByID(serial);
                    request.currentPlayer = manageGames.getGameByID(serial).getPlayerById(request.body.id);
                    request.currentOpponent = manageGames.getGameByID(serial).getOpponent(request.body.id);
                }
                next();
            }
        });

        io.on("connection", function(socket) {

            socket.on("playerName", function(data) {

                if(manageGames.verifyAvailabilityNickname(data)) {
                    manageGames.createPlayer(data, socket.id);
                    console.log(`${data} vient de se connecter.`);
                    socket.emit("nicknameConfirmed", {id: socket.id});
                } else {
                    console.log(`Le pseudo ${data} est déjà pris`);
                    socket.emit("nicknameAllreadyTaken");
                }

                socket.join(`game ${manageGames.getNumberOfGames()}`, function() {

                    if(manageGames.canStartNewGame()) {
                        manageGames.startNewGame(manageGames.getNumberOfGames(), 36, fullDeck);
                        let currentGameNumber = manageGames.getNumberOfGames() - 1;
                        let currentGame = manageGames.getGameByID(currentGameNumber);
                        console.log(`Partie lancée numéro ${manageGames.getNumberOfGames() - 1}.`);
                        io.to(`${currentGame.getPlayer1().getId()}`).emit('newGame', currentGame.getGamesInformation(currentGame.getPlayer1().getId()));
                        io.to(`${currentGame.getPlayer2().getId()}`).emit('newGame', currentGame.getGamesInformation(currentGame.getPlayer2().getId()));
                    } else {
                        socket.emit("waitingForPlayer");
                        console.log(`1 joueur dans la partie ${manageGames.getNumberOfGames()}, attente du prochain joueur`);
                    }
                });
            });

            router.post("/game/:serial/draw", function ({currentGame, currentPlayer, currentOpponent, serial, body}, response) {
                if (!currentPlayer.canDraw(body.quantity)) {
                    console.log(`Le joueur ${currentPlayer.getName()} ne peut pas piocher ${body.quantity} cartes dans la partie numéro ${serial}.`);
                    response.status(404).send('Vous avez déjà le nombre max de cartes en main.');
                } else {
                    let cardDrawedForPlayer = currentGame.getDeck().drawCard(body.quantity);
                    currentPlayer.addCardsToHand(cardDrawedForPlayer);
                    console.log(`Le joueur ${currentPlayer.getName()} viens de piocher ${body.quantity} cartes dans la partie numéro ${serial}.`);
                    let currentResponse = {
                        "cards": cardDrawedForPlayer,
                        "player": currentPlayer.getEffect(),
                        "opponent": currentOpponent.getEffect(),
                        "remaining": currentGame.getDeck().getRemaining()
                    };
                    currentPlayer.setEffectSet(false);
                    response.status(200).send(currentResponse);
                }
            });

            router.post("/game/:serial/play", function ({currentGame, currentPlayer, currentOpponent, serial, body}, response) {
                if(!currentPlayer.setCardPlayed(body.hashCode)) {
                    console.log(`Impossible pour le joueur ${currentPlayer.getName()} de jouer une carte dans la partie ${serial}.`);
                    response.status(405).send("Vous ne pouvez pas jouer.")
                } else {
                    if(currentOpponent.canPlay()) {
                        io.to(`${currentPlayer.getId()}`).emit("waitingOpponentPlaying");
                        response.status(200).end();
                    } else {
                        let cardPlayedPlayer = currentPlayer.getCardPlayed();
                        let cardPlayedOpponent = currentOpponent.getCardPlayed();
                        console.log(`Cartes jouées pour les joueurs dans la partie ${serial}`);
                        io.to(`${currentOpponent.getId()}`).emit('opponentPlayed', {player: cardPlayedOpponent, opponent: cardPlayedPlayer});
                        io.to(`${currentPlayer.getId()}`).emit('opponentPlayed', {player: cardPlayedPlayer, opponent: cardPlayedOpponent});
                        currentGame.setGameEffects(currentPlayer.getId());
                        currentGame.setGameEffects(currentOpponent.getId());
                        response.status(200).end();
                    }
                }
            });

            socket.on("outcomeWanted", function({gameID, playerID}) {
                let currentGame = manageGames.getGameByID(gameID);
                let currentPlayer = currentGame.getPlayerById(playerID);
                let currentOpponent = currentGame.getOpponent(playerID);
                let battleResult = currentGame.getBattleResult(currentPlayer, currentOpponent);

                socket.emit(currentGame.isFinish() ? "finalOutcome" : "outcome", battleResult);
            });

            socket.on("nextTurnWanted", function({gameID, playerID}) {
                let currentGame = manageGames.getGameByID(gameID);
                let currentPlayer = currentGame.getPlayerById(playerID);
                let currentOpponent = currentGame.getOpponent(playerID);

                if(!currentPlayer.isEffectSet()) {
                    currentPlayer.setEffectSet(true);
                }
                if(currentOpponent.isEffectSet()) {
                    currentGame.nextTurn();
                    console.log(`Effets et Future effets activés pour la partie numéro ${gameID}`);
                    io.to(`${currentOpponent.getId()}`).emit('okForNextTurn');
                    io.to(`${currentPlayer.getId()}`).emit('okForNextTurn');
                }
            });

            router.post("/game/:serial/winner", function ({currentGame, currentPlayer, serial}, response) {
                let winner = currentGame.getWinnerOfTheGame(currentPlayer.getId());
                if(winner == null) {
                    console.log(`La partie numéro ${serial} n'est pas finie !`);
                    response.status(405).send("La partie n'est pas finie !");
                } else {
                    console.log(`Fin de la partie numéro ${serial}`);
                    io.to(`${currentPlayer.getId()}`).emit("enOfGame", winner);
                    response.status(200).end();
                }
            });

            router.post("/game/:serial/graveyard", function ({currentGame, currentPlayer, serial, body}, response) {
                console.log(`Cimetière consulté pour la partie numéro ${serial}.`);
                response.send(currentGame.getGraveyard());
            });

            socket.on("disconnect", function() {
                if(manageGames.getStatusOfCurrentGame() == 1) {
                    manageGames.resetPlayer();
                } else {
                    let {player, opponent} = manageGames.findPlayerById(socket.id).player;
                    if(player != null) {
                        io.to(`${opponent.getId()}`).emit("opponentDeconnection");
                        console.log(`Déconnection du joueur ${player.getName()}`);
                    }
                }
            });
        });

        app.use("/", router);

        let port = process.env.PORT || 3000;

        server.listen(port, function () {
            console.log("Serveur lancé !");
        });
    }

)();