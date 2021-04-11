#include "Player.hpp"
#include "../Game.hpp"
namespace Collapsa {
    Player::Player(Game * t_p_game, std::string t_socketid): Entity(Position(30, 40), Health::Options(30, 40), t_p_game) {};
}