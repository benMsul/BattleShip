/*jslint browser this */
/*global _, player */

(function (global) {
    "use strict";

    var computer = _.assign({}, player, {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        play: function () {
            var self = this;
            setTimeout(function () {
                //declaration des variable x et y
                var x = self.randomPos();
                var y = self.randomPos();
                self.game.fire(this, x, y, function (hasSucced) {
                    self.tries[y][x] = hasSucced;
                    if(hasSucced){
                        document.querySelector('.mini-grid').children[y].children[x].style.backgroundColor = '#e60019';      
                    }
                    // if(!hasSucced){
                    //     document.querySelector('.mini-grid').children[y].children[x].style.backgroundColor = '#aeaeae';                        
                    // }
                    // console.log(a, b);
                    // console.table(self.tries);
                }); 
            }, 2000);
        },
        isShipOk: function (callback) {
            var i = 0;
            while(i < 4){
                var axe = this.randomAxe(); // Utilise la méthode plus bas qui choisis l'axe de manière random
                var y = this.randomPos(); // Défini une position Y random
                var x = this.randomPos(); // Défini une position X random

                // Permet de placer le bateau avec la méthode setActiveShipPosition & de passer au suivant
                if(this.game.axe === "Horizontale" && this.setActiveShipPosition(y,x, axe) 
                || this.game.axe === "Verticale" && this.setActiveShipPosition(y,x, axe)) {
                    // Cherche s'il y a encore des bateaux à placer
                    this.activateNextShip();
                    i += 1;
                }

            }
            setTimeout(function () {
                callback();
            }, 500);
            console.table(this.grid);
        },
        randomAxe: function() {
            // Défini un axe random pour le placement des bateaux de l'ordinateur
            var rand = Math.random() * 10;
            if(rand > 4) {
                this.game.axe = 'Horizontale';
            } 
            else {
                this.game.axe = 'Verticale';
            }
        }
    });

    global.computer = computer;

}(this));