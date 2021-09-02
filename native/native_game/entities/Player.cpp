#include "Player.hpp"
#include "../Game.hpp"
std::default_random_engine generator;
std::uniform_int_distribution<int> distribution(16, 110);
auto ranPos = std::bind(distribution, generator);
namespace Collapsa {
    int** Player::Viewport::update() {
        Entity** t_entities = p_game->array_p_entities;
        std::set<int> entityIDs = p_game->qtree.query(
            (double) center.x - width/2,
            (double) center.y - height/2,
            (double) center.x + width/2,
            (double) center.y + height/2
        );
        //std::cout << center.x - 160 << "  " << center.y - 90 << "  " << center.x + 160 << "  " << center.y + 90 << std::endl;
        std::set<int> playerIds;
        for (int entityID: entityIDs) {
            Entity* entity = t_entities[entityID];
            if(entity->is == constants::PLAYER::TYPE) playerIds.insert(entity->id);
        };
        int** change = new int* [1] {
            new int [constants::PLAYER::LIMIT] { 0 }
        };
        for (int ID: playerIds) change[0][ID]+= change[0][ID] < 1;
        for (int ID: playerIDs) change[0][ID]-= change[0][ID] > -1;
        playerIDs = playerIds;
        return change;
    };
    std::set<int>* Player::Viewport::animate() {
        Entity** t_entities = p_game->array_p_entities;
        std::set<int>* animations = new std::set<int>[1];
        for (int ID: playerIDs) if(p_game->array_p_players[ID]->animated) animations[0].insert(ID);
        return animations;
    };
    void Player::animateViewport() {
        std::set<int>* animations = viewport.animate();
        if ((animations[0].size()) == 0){
            delete[] animations;
            return;
        };
        // 00000000 00000000 00000000
        // PlayerID Rotation Item    
        constexpr uint16_t playerAnimationSize = 3;
        uint32_t animationSize = 2 + animations[0].size() * playerAnimationSize;
        OutputMessage *animationMessage = new OutputMessage { 
            new uint8_t[animationSize]{ 0 }, animationSize, socketid
        };
        Writer w { animationMessage->buffer, animationMessage->byteLength };
        w.writeUint8(constants::MSG_TYPES::PLAYER_VISUAL).writeUint8(animations[0].size());
        for (int ID: animations[0]) {
            Player* player = p_game->array_p_players[ID];
            w.writeUint8(player->id)
                .writeUint8(player->movement[2])
                .writeUint8(player->movement[1]);
        };
        p_game->pushOutputMessage(animationMessage);
        delete[] animations;
    }
    void Player::updateViewport() { 
        int** viewportChange = viewport.update(); 
        int change[1][2] { 0 };
        for (int i = 0; i < constants::PLAYER::LIMIT;i++) {
            change[0][0] += (viewportChange[0][i] == 1);
            change[0][1] += (viewportChange[0][i] == -1);
        }
        // 00000000 00000000 0000000000000000 0000000000000000 00000000 00000000 00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
        // PlayerID Rotation XPosition        YPosition        XVel     YVel     Username
        constexpr uint16_t newPlayerSize = 1 + 1 + 2 + 2 + 1 + 1 + 16;
        uint32_t addSize = 2 + change[0][0] * newPlayerSize;
        uint32_t removeSize = 2 + change[0][1] * 1;
        if (addSize > 2) {
            OutputMessage *addEntitiesMessage = new OutputMessage { 
                new uint8_t[addSize]{ 0 }, addSize, socketid
            };
            Writer w { addEntitiesMessage->buffer, addEntitiesMessage->byteLength };
            w.writeUint8(constants::MSG_TYPES::ADD_ENTITY).writeUint8(change[0][0]);
            for (int i = 0; i < constants::PLAYER::LIMIT;i++) {
                if (viewportChange[0][i] < 1) continue;
                Player* player = p_game->array_p_players[i];
                w.writeUint8(player->id)
                    .writeUint8(player->movement[2 ])
                    .writeUint16((double) player->p_body->position.x, false)
                    .writeUint16((double) player->p_body->position.y, false)
                    .writeInt8((double) player->p_body->velocity.x * 1'000'000)
                    .writeInt8((double) player->p_body->velocity.y * 1'000'000)
                    .writeString(player->username, 16);
            };
            p_game->pushOutputMessage(addEntitiesMessage);
        };
        if (removeSize > 2) {
            OutputMessage *removeEntitiesMessage = new OutputMessage {
                new uint8_t[removeSize]{ 0 }, removeSize, socketid
            };
            Writer w { removeEntitiesMessage->buffer, removeEntitiesMessage->byteLength };
            w.writeUint8(constants::MSG_TYPES::REMOVE_ENTITY).writeUint8(change[0][1]);
            for (int i = 0; i < constants::PLAYER::LIMIT;i++) {
                if (viewportChange[0][i] > -1) continue;
                Player* player = p_game->array_p_players[i];
                w.writeUint8(i);
            };
            p_game->pushOutputMessage(removeEntitiesMessage);
        };
        delete [] viewportChange[0];
        delete [] viewportChange;
        // 00000000 0000000000000000 0000000000000000 00000000 00000000
        // PlayerID XPosition        YPosition        XVel     YVel    
        constexpr uint16_t updatePlayerSize = 1 + 2 + 2 + 1 + 1;
        uint32_t updateSize = 1 + 1 + viewport.playerIDs.size() * updatePlayerSize;
        if (updateSize > 2) {
            OutputMessage *updateMessage = new OutputMessage {
                new uint8_t[updateSize]{ 0 }, updateSize, socketid
            };
            Writer w { updateMessage->buffer, updateMessage->byteLength };
            w.writeUint8(constants::MSG_TYPES::GAME_UPDATE).writeUint8(viewport.playerIDs.size());
            for(int ID: viewport.playerIDs) {
                Player* player = p_game->array_p_players[ID];
                w.writeUint8(player->id)
                    .writeUint16((double) player->p_body->position.x, false)
                    .writeUint16((double) player->p_body->position.y, false)
                    .writeUint8((double) player->p_body->velocity.x * 1'000'000)
                    .writeUint8((double) player->p_body->velocity.y * 1'000'000);
            };
            p_game->pushOutputMessage(updateMessage);
        };
    };
    Player::Player(Game* t_p_game, std::string t_socketid, std::string t_username, int t_id, int t_entityid):
        Entity(Health(0, 20), t_p_game, t_entityid),
        socketid(t_socketid),
        username(t_username),
        viewport(t_p_game)
    {
        is = constants::PLAYER::TYPE;
        p_body = new Body::Circle(32, Vector::Double(ranPos(), ranPos(), 16, 239, 16, 239));
        viewport.center = p_body->position;
        viewport.width = 320;
        viewport.height = 180;
        this->id = t_id;
    };
    void Player::populateAABB(int* x1, int* y1, int* x2, int* y2) {
        *x1 = (double) p_body->position.x - 16;
        *y1 = (double) p_body->position.y - 16;
        *x2 = (double) p_body->position.x + 16;
        *y2 = (double) p_body->position.y + 16;
    };
    void Player::update(long long t_delta) {
        const Vector::Double nullvelocity { 0, 0 };
        if (p_body->velocity != Vector::Double {0, 0}) p_body->hasMoved = true;
        p_body->velocity.x = 0;
        p_body->velocity.y = 0;
        if (movement[0] != 0) {
            double speed = 10.0 / 1000000.0;
            p_body->previousPosition = p_body->position;
            if (movement[0] & 1) p_body->velocity.y = speed;
            if (movement[0] & 2) p_body->velocity.x = -speed;
            if (movement[0] & 4) p_body->velocity.y = -speed;
            if (movement[0] & 8) p_body->velocity.x = speed;
            //std::cout << t_delta * speed << " " << t_delta << " " << speed << " " << p_body->hasMoved << "\n";
        }
        if (!(p_body->velocity == Vector::Double {0, 0})) p_body->hasMoved = true;
        p_body->position.x += (double) p_body->velocity.x * t_delta;
        p_body->position.y += (double) p_body->velocity.y * t_delta;
        viewport.center = p_body->position;
    };
}