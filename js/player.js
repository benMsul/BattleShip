/*jslint browser this */
/*global _, shipFactory, player, utils */

(function (global) {
    "use strict";

    var ship = {dom: {parentNode: {removeChild: function () {}}}};

    var player = {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        activeShip: 0,
        init: function () {
            // créé la flotte
            this.fleet.push(shipFactory.build(shipFactory.TYPE_BATTLESHIP));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_DESTROYER));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SUBMARINE));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SMALL_SHIP));

            // créé les grilles
            this.grid = utils.createGrid(10, 10);
            this.tries = utils.createGrid(10, 10);
        },  
        play: function (col, line) {
            // appel la fonction fire du game, et lui passe une callback pour récupérer le résultat du tir
            this.game.fire(this, col, line, _.bind(function (hasSucced) {
                this.tries[line][col] = hasSucced;
            }, this));
        },
        // quand il est attaqué le joueur doit dire si il a un bateaux ou non à l"emplacement choisi par l"adversaire
        receiveAttack: function (col, line, callback) {
            var succeed = false;
            var hit = false;

            if(this.grid[line][col] === "HIT" || this.grid[line][col] === "MISS"){
            hit = true;
            }

            if (this.grid[line][col] !== 0 && this.grid[line][col] !== "MISS" ) {
                succeed = true;
                this.grid[line][col] = "HIT";
            }
            else if (this.grid[line][col] == 0){
                this.grid[line][col] = "MISS";
            }
            console.log(self.player.fleet[0]);
            
            callback.call(undefined, succeed, hit);
        },
        setActiveShipPosition: function (x, y, axe) {
            var ship = this.fleet[this.activeShip];
            var axe = this.game.axe;
            
            var i = 0;
            var j = 0; // j récupère la vie du bateau & check si la case est pleine            
            var h = 0; // h récupère la vie du bateau & check si la case est pleine
            
            if (this.game.axe === "Horizontale") {
                // décale le curseur pour revenir au début du ship
                x = x - Math.floor(ship.getLife()/2);
                while(j < ship.getLife()) {
                    if(this.grid[y][x + j] != 0){
                        return false;
                    }
                    j += 1;
                }
                while (i < ship.getLife()) {
                    this.grid[y][x + i] = ship.getId();
                    i += 1;
                }
                // console.table(this.grid);
                return true;
            }
            else {
                // décale le curseur pour revenir au début du ship
                y = y - Math.floor(ship.getLife()/2);
                while(h < ship.getLife()) {
                    if(typeof(this.grid[y+h]) === "undefined") {
                        return false;
                    }
                    else if(this.grid[y + h][x] !== 0){
                        return false;
                    }
                    h += 1;
                }
                i = 0;
                while (i < ship.getLife()) {
                    this.grid[y + i][x] = ship.getId();
                    i += 1;
                }
                // console.table(this.grid);
                return true;
            }
        },
        clearPreview: function () {
            this.fleet.forEach(function (ship) {var soundhit = new Audio("sound/hit.ogg");
            if (ship.dom.parentNode) {
                ship.dom.parentNode.removeChild(ship.dom);
            }
        });
    },
    resetShipPlacement: function (){
        this.clearPreview();
        
        this.activeShip = 0;
        this.grid = utils.createGrid(10, 10);
    },
    activateNextShip: function () {
        if (this.activeShip < this.fleet.length - 1) {
            this.activeShip += 1;
            return true;
        } else {
            return false;
        }
    },
    renderTries: function (grid) {
        this.tries.forEach(function (row, rid) {
            row.forEach(function (val, col) {
                var node = grid.querySelector(".row:nth-child(" + (rid + 1) + ") .cell:nth-child(" + (col + 1) + ")");
                
                if (val === true) {
                    
                    node.style.backgroundColor = "#e60019";
                    var soundhit = new Audio("sound/hit.ogg");
                    soundhit.play();
                    node.classList.add("hit");
                } 
                else if (val === false) {
                    node.style.backgroundColor = "#aeaeae";
                    var soundmiss = new Audio("sound/miss.ogg");
                    soundmiss.play();
                    node.classList.add("miss");
                }
            });
        });
    },
    
    renderShips: function (grid, minigrid) {
        grid.forEach( function (ship) {
            minigrid.innerHTML += ship.dom.outerHTML;
        });
    },
    randomPos: function(){
        return Math.floor(Math.random() * 10);
    },
    
    setGame:function(game){
        this.game = game;
    },
    
};

global.player = player;

}(this));