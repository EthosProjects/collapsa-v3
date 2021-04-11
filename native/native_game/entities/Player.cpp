#include "Player.hpp"
#include "../Game.hpp"
Player::Player(Game * t_p_game, std::string t_socketid): Entity(Position(30, 40), HealthOptions(30, 40), t_p_game) {};