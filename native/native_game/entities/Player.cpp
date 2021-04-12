#include "Player.hpp"
#include "../Game.hpp"
namespace Collapsa {
    Player::Player(Game * t_p_game, std::string t_socketid, int t_id, int t_entityid): 
        Entity(Health::Options(30, 40), t_p_game, t_entityid) {
            m_body = new Body::Circle(64);
            //Position::Overwrite(30, 40), 
            //m_body(t_positionOverwrite),
            this->id = t_id;
        };
    void Player::populateAABB(int* x1, int* y1, int* x2, int* y2){
        Position::Overwrite position = m_body->getPosition();
        *x1 = position.x - 64;
        *x2 = position.x + 64;
        *x2 = position.y - 64;
        *y2 = position.y + 64;
        std::cout << "Player populated AABB" << std::endl;
    }
}