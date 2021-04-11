#pragma once
#include "Entity.hpp"
#include "../../../node_modules/node-addon-api/napi.h"
class Circle;
namespace Collapsa {
    class Player: public Entity {
        std::string m_socketid;
    public:
        Player(Game*, std::string);
    };
}