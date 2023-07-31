/*jslint browser this */
/*global _, player, computer, utils */

(function () {
    "use strict";

    var game = {
        PHASE_INIT_PLAYER: "PHASE_INIT_PLAYER",
        PHASE_INIT_OPPONENT: "PHASE_INIT_OPPONENT",
        PHASE_PLAY_PLAYER: "PHASE_PLAY_PLAYER",
        PHASE_PLAY_OPPONENT: "PHASE_PLAY_OPPONENT",
        PHASE_GAME_OVER: "PHASE_GAME_OVER",
        PHASE_WAITING: "waiting",

        currentPhase: "",
        phaseOrder: [],
        // garde une référence vers l'indice du tableau phaseOrder qui correspond à la phase de jeu pour le joueur humain
        playerTurnPhaseIndex: 2,

        // l'interface utilisateur doit-elle être bloquée ?
        waiting: false,

        // garde une référence vers les nœuds correspondant du dom
        grid: null,
        miniGrid: null,

        ////////// axe
        axe: "Horizontale",

        // liste des joueurs
        players: [],

        // lancement du jeu
        init: function () {

            // initialisation
            this.grid = document.querySelector('.board .main-grid');
            this.miniGrid = document.querySelector('.mini-grid');

            // défini l'ordre des phase de jeu
            this.phaseOrder = [
                this.PHASE_INIT_PLAYER,
                this.PHASE_INIT_OPPONENT,
                this.PHASE_PLAY_PLAYER,
                this.PHASE_PLAY_OPPONENT,
                this.PHASE_GAME_OVER
            ];
            this.playerTurnPhaseIndex = 0;

            // initialise les joueurs
            this.setupPlayers();

            // ajoute les écouteur d'événement sur la grille
            this.addListeners();

            // c'est parti !
            this.goNextPhase();
        },
        setupPlayers: function () {
            // donne aux objets player et computer une réference vers l'objet game
            player.setGame(this);
            computer.setGame(this);

            // todo : implémenter le jeu en réseaux
            this.players = [player, computer];

            this.players[0].init();
            this.players[1].init();
        },
        goNextPhase: function () {
            // récupération du numéro d'index de la phase courante
            var ci = this.phaseOrder.indexOf(this.currentPhase);
            var self = this;
            if (ci !== this.phaseOrder.length - 1) {
                this.currentPhase = this.phaseOrder[ci + 1];
            } else {
                this.currentPhase = this.phaseOrder[0];
            }

            switch (this.currentPhase) {
            case this.PHASE_GAME_OVER:
                // detection de la fin de partie
                if (!this.gameIsOver()) {
                    // le jeu n'est pas terminé on recommence un tour de jeu
                    this.currentPhase = this.phaseOrder[this.playerTurnPhaseIndex];
                }
                break;
            case this.PHASE_INIT_PLAYER:
                utils.info("Placez vos bateaux");
                break;
            case this.PHASE_INIT_OPPONENT:
                this.wait();
                utils.info("En attente de votre adversaire");
                this.players[1].isShipOk(function () {
                    self.stopWaiting();
                    self.goNextPhase();
                });
                break;
            case this.PHASE_PLAY_PLAYER:
                utils.info("A vous de jouer, choisissez une case !");
                break;
            case this.PHASE_PLAY_OPPONENT:
                utils.info("A votre adversaire de jouer...");
                this.players[1].play();
                this.currentPhase = this.PHASE_INIT_OPPONENT;
                break;
            }

        },
        gameIsOver: function () {
            //return false;
            this.grid.style.opacity = "0.8";
        },
        getPhase: function () {
            if (this.waiting) {
                return this.PHASE_WAITING;
            }
            return this.currentPhase;
        },
        // met le jeu en mode "attente" (les actions joueurs ne doivent pas être pris en compte si le jeu est dans ce mode)
        wait: function () {
            this.waiting = true;
        },
        // met fin au mode mode "attente"
        stopWaiting: function () {
            this.waiting = false;
        },
        addListeners: function () {
            // on ajoute des acouteur uniquement sur la grid (délégation d'événement)
            this.grid.addEventListener('mousemove', _.bind(this.handleMouseMove, this));
            this.grid.addEventListener('click', _.bind(this.handleClick, this));
            ////////////////////////
            this.grid.addEventListener('contextmenu', _.bind(this.handleRightClick, this));
        },
        ///////////// Changer la position de l'axe///////////////
        handleRightClick:function(e){
            if(this.getPhase() === this.PHASE_INIT_PLAYER){
                e.preventDefault();
                var ship = this.players[0].fleet[this.players[0].activeShip];
                 if(this.axe === "Horizontale"){
                    this.axe = "Verticale";
                    ship.dom.style.transform = "rotate(90deg)";
                }else{
                    this.axe = "Horizontale";
                    ship.dom.style.transform = "rotate(180deg)";
                }
                this.handleMouseMove(e);
            }
        },
        handleMouseMove: function (e) {
            // on est dans la phase de placement des bateau
            if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains('cell')) {
                var ship = this.players[0].fleet[this.players[0].activeShip];

                // si on a pas encore affiché (ajouté aux DOM) ce bateau
                if (!ship.dom.parentNode) {
                    this.grid.appendChild(ship.dom);
                    // passage en arrière plan pour ne pas empêcher la capture des événements sur les cellules de la grille
                    ship.dom.style.zIndex = -1;
                }

                // décalage visuelle, le point d'ancrage du curseur est au milieu du bateau
                if(((ship.life)%2) === 0 && this.axe === 'Verticale') {
                    // console.log('e');
                    ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + (this.players[0].activeShip) * 60) - 30 + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + 30 + "px";
                }
                else {
                    ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + (this.players[0].activeShip) * 60) + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
                }
            }
        },
        handleClick: function (e) {
            // self garde une référence vers "this" en cas de changement de scope
            var self = this;

            // si on a cliqué sur une cellule (délégation d'événement)
            if (e.target.classList.contains('cell')) {
                // si on est dans la phase de placement des bateau
                if (this.getPhase() === this.PHASE_INIT_PLAYER) {
                    // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
                    if (this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode))) {
                        this.axe = "Horizontale";
                        // et on passe au bateau suivant (si il n'y en plus la fonction retournera false)
                        if (!this.players[0].activateNextShip()) {
                            this.wait();
                            utils.confirm("Confirmez le placement ?", function () {
                                // si le placement est confirmé
                                self.stopWaiting();
                                self.renderMiniMap();
                                self.players[0].clearPreview();
                                self.goNextPhase();
                            }, function () {
                                self.stopWaiting();
                                // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                                self.players[0].resetShipPlacement();
                            })
                        }
                    }
                // si on est dans la phase de jeu (du joueur humain)
                } else if (this.getPhase() === this.PHASE_PLAY_PLAYER) {
                    this.players[0].play(utils.eq(e.target), utils.eq(e.target.parentNode));
                    this.renderMap();
                }
            }
        },
        // fonction utilisée par les objets représentant les joueurs (ordinateur ou non)
        // pour placer un tir et obtenir de l'adversaire l'information de réussite ou non du tir
        fire: function (from, col, line, callback) {
            this.wait();
            var self = this;
            var msg = "";

            // determine qui est l'attaquant et qui est attaqué
            var target = this.players.indexOf(from) === 0
                ? this.players[1]
                : this.players[0];

            if (this.currentPhase === this.PHASE_PLAY_OPPONENT) {
                msg += "Votre adversaire vous a... ";
            }

            // on demande à l'attaqué si il a un bateaux à la position visée
            // le résultat devra être passé en paramètre à la fonction de callback (3e paramètre)
            target.receiveAttack(col, line, function (hasSucceed, hit) {

                if (hasSucceed) {
                    msg += "Touché !";
                    msg += "<br>";
                } 
                else {
                    msg += "Manqué...";
                    msg += "<br>";
                }
                if(hit === true && self.currentPhase === self.PHASE_PLAY_PLAYER){
                    msg += "OUPS! nous avons déjà tenté le coup";
                }
                

                var myGrid = self.players[0].grid;
                
                var battleship_HP = [];
                var destroyer_HP = [];
                var submarine_HP = [];
                var small_ship_HP = [];
                
                var battleship_img = document.querySelector('.fleet .battleship');
                var destroyer_img = document.querySelector('.fleet .destroyer');
                var submarine_img = document.querySelector('.fleet .submarine');
                var small_ship_img = document.querySelector('.fleet .small-ship');
                                
                myGrid.forEach(x => { if(x.includes(1)) { battleship_HP.push(x) } });
                myGrid.forEach(x => { if(x.includes(2)) { destroyer_HP.push(x) } });
                myGrid.forEach(x => { if(x.includes(3)) { submarine_HP.push(x) } });
                myGrid.forEach(x => { if(x.includes(4)) { small_ship_HP.push(x) } });
                
                if(battleship_HP.length === 0 
                && battleship_img.classList.contains("sunk") === false){
                    battleship_img.classList.add("sunk");
                }
                if(destroyer_HP.length === 0 
                && destroyer_img.classList.contains("sunk") === false){
                    destroyer_img.classList.add("sunk");
                }
                if(submarine_HP.length === 0 
                && submarine_img.classList.contains("sunk") === false){
                    submarine_img.classList.add("sunk");
                }
                if(small_ship_HP.length === 0 
                && small_ship_img.classList.contains("sunk") === false){
                    small_ship_img.classList.add("sunk");
                }
                if(battleship_HP.length === 0  && destroyer_HP.length === 0 && submarine_HP.length === 0 && small_ship_HP.length === 0){
                    this.currentPhase = this.PHASE_GAME_OVER;
                }

                utils.info(msg);

                // on invoque la fonction callback (4e paramètre passé à la méthode fire)
                // pour transmettre à l'attaquant le résultat de l'attaque
                callback(hasSucceed , hit);

                // on fait une petite pause avant de continuer...
                // histoire de laisser le temps au joueur de lire les message affiché
                setTimeout(function () {
                    self.stopWaiting();
                    self.goNextPhase();
                }, 1000);
            });

        },
        renderMap: function () {
            this.players[0].renderTries(this.grid);
        },
        renderMiniMap: function () {
            var minigrid = this.miniGrid;
            this.players[0].renderShips(this.players[0].fleet, minigrid);
            this.miniGrid.style.marginTop = "-210px";
        },
    };

    // point d'entrée
    document.addEventListener('DOMContentLoaded', function () {
        game.init();
    });

}());