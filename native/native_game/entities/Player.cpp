#include "Player.hpp"
#include "../Game.hpp"
Player::Player(Game * gamePointer): Entity(Position(30, 40), 100, gamePointer) {
    game->PrintValue("help");
};