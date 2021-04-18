#pragma once
#include "Entity.hpp"
#include "../../../node_modules/node-addon-api/napi.h"
class Circle;
namespace Collapsa {
    class Player: public Entity {
        std::string m_socketid;
    public:
        Player(Game* t_p_game, std::string t_socketid, int t_id, int t_entityid);
        void populateAABB(int* x1, int* y1, int* x2, int* y2) override;
    };
}