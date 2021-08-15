#include "Player.hpp"
#include "../Game.hpp"
std::default_random_engine generator;
std::uniform_int_distribution<int> distribution(0, 255);
auto ranPos = std::bind(distribution, generator);
namespace Collapsa {
    void Player::Viewport::populate(Player* t_player, quadtree::Quadtree t_quadtree, Entity** t_entities) {
        std::set<int> entityIds = t_quadtree.query(
            centerX - width,
            centerY - height,
            centerX + width,
            centerY + height
        );
        std::set<int> playerIds;
        for (int i: entityIds) {
            Entity* entity = *(t_entities + i);
            if(entity->is == constants::PLAYER::TYPE) playerIds.insert(i);
        };
        playerIDs = playerIds;
    };
    void Player::populateViewport() {
        viewport.populate(this, m_p_game->m_quadtree, m_p_game->m_entities);
    };
    Player::Player(Game* t_p_game, std::string t_socketid, std::string t_username, int t_id, int t_entityid):
        Entity(Health::Options(0, 100), t_p_game, t_entityid),
        socketid(t_socketid),
        username(t_username),
        previousPosition(ranPos(), ranPos())
    {
        is = constants::PLAYER::TYPE;
        body = new Body::Circle(32, PositionOld::Overwrite(previousPosition.x, previousPosition.y));
        this->id = t_id;
    };
    void Player::populateAABB(int* x1, int* y1, int* x2, int* y2) {
        PositionOld::Overwrite position = body->getPosition();
        *x1 = position.x - 32;
        *y1 = position.y - 32;
        *x2 = position.x + 32;
        *y2 = position.y + 32;
    };
    void Player::update(long long t_delta) {
        if (movement[0] != 0) {
            float speed = 10.0 / 1000000.0;
            previousPosition.x = body->getPosition().x;
            previousPosition.y = body->getPosition().y;
            if (movement[0] & 1) body->position.m_y += t_delta * speed;
            if (movement[0] & 2) body->position.m_x -= t_delta * speed;
            if (movement[0] & 3) body->position.m_y -= t_delta * speed;
            if (movement[0] & 4) body->position.m_x += t_delta * speed;
            std::cout << t_delta * speed << " " << t_delta << " " << speed << "\n";
        }
    };
}