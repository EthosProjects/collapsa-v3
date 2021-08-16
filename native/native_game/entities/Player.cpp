#include "Player.hpp"
#include "../Game.hpp"
std::default_random_engine generator;
std::uniform_int_distribution<int> distribution(0, 255);
auto ranPos = std::bind(distribution, generator);
namespace Collapsa {
    int** Player::Viewport::update() {
        Entity** t_entities = p_game->array_p_entities;
        std::set<int> entityIds = p_game->qtree.query(
            center.x - width/2,
            center.y - height/2,
            center.x + width/2,
            center.y + height/2
        );
        //std::cout << center.x - 160 << "  " << center.y - 90 << "  " << center.x + 160 << "  " << center.y + 90 << std::endl;
        std::set<int> playerIds;
        for (int i: entityIds) {
            Entity* entity = *(t_entities + i);
            if(entity->is == constants::PLAYER::TYPE) playerIds.insert(i);
        };
        int** change = new int* [1] {
            new int [constants::PLAYER::LIMIT] { 0 }
        };
        for (int ID: playerIds) change[0][ID]+= change[0][ID] < 1;
        for (int ID: playerIDs) change[0][ID]-= change[0][ID] > -1;
        playerIDs = playerIds;
        return change;
    };
    void Player::updateViewport() { 
        int** viewportChange = viewport.update(); 
        int change[1][2] { 0 };
        for (int i = 0; i < constants::PLAYER::LIMIT;i++) {
            change[0][0] += (viewportChange[0][i] == 1);
            change[0][1] += (viewportChange[0][i] == -1);
        }
        // 00000000 0000000000000000 0000000000000000 00000000 0000000 
        // PlayerID XPosition        YPosition        XVel     YVel
        constexpr uint16_t compressedPlayerSize = 1 + 4 + 2 + 16;
        uint32_t addSize = 2 + change[0][0] * compressedPlayerSize;
        uint32_t removeSize = 2 + change[0][1] * 1;
        if (addSize > 2) {
            OutputMessage *addEntitiesMessage = new OutputMessage { 
                new uint8_t[addSize]{ 0 }, 
                addSize,
                socketid
            };
            Writer w { addEntitiesMessage->buffer, addEntitiesMessage->byteLength };
            w.writeUint8(constants::MSG_TYPES::ADD_ENTITY).writeUint8(change[0][0]);
            for (int i = 0; i < constants::PLAYER::LIMIT;i++) {
                if (viewportChange[0][i] < 1) continue;
                Player* player = p_game->array_p_players[i];
                w.writeUint8(player->id)
                    .writeUint16(player->p_body->position.x, false)
                    .writeUint16(player->p_body->position.y, false)
                    .writeUint16(0, false)
                    .writeString(player->username, 16);
            };
            p_game->pushOutputMessage(addEntitiesMessage);
        };
        if (removeSize > 2) {
            OutputMessage *removeEntitiesMessage = new OutputMessage {
                new uint8_t[removeSize]{ 0 }, 
                removeSize,
                socketid
            };
            Writer w { removeEntitiesMessage->buffer, removeEntitiesMessage->byteLength };
            w.writeUint8(constants::MSG_TYPES::REMOVE_ENTITY).writeUint8(change[0][1]);
            for (int i = 0; i < constants::PLAYER::LIMIT;i++) {
                if (viewportChange[0][i] > -1) continue;
                Player* player = p_game->array_p_players[i];
                w.writeUint8(player->id);
            };
            p_game->pushOutputMessage(removeEntitiesMessage);
        }
    };
    Player::Player(Game* t_p_game, std::string t_socketid, std::string t_username, int t_id, int t_entityid):
        Entity(Health::Options(0, 100), t_p_game, t_entityid),
        socketid(t_socketid),
        username(t_username),
        viewport(t_p_game)
    {
        is = constants::PLAYER::TYPE;
        p_body = new Body::Circle(32, Vector::Double(ranPos(), ranPos()));
        viewport.center = p_body->position;
        viewport.width = 320;
        viewport.height = 180;
        this->id = t_id;
    };
    void Player::populateAABB(int* x1, int* y1, int* x2, int* y2) {
        *x1 = p_body->position.x - 32;
        *y1 = p_body->position.y - 32;
        *x2 = p_body->position.x + 32;
        *y2 = p_body->position.y + 32;
    };
    void Player::update(long long t_delta) {
        if (movement[0] != 0) {
            double speed = 10.0 / 1000000.0;
            p_body->previousPosition = p_body->position;
            p_body->hasMoved = true;
            if (movement[0] & 1) p_body->position.y += t_delta * speed;
            if (movement[0] & 2) p_body->position.x -= t_delta * speed;
            if (movement[0] & 4) p_body->position.y -= t_delta * speed;
            if (movement[0] & 8) p_body->position.x += t_delta * speed;
            viewport.center = p_body->position;
            //std::cout << t_delta * speed << " " << t_delta << " " << speed << "\n";
        }
    };
}