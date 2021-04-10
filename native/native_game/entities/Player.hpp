#pragma once
#include "Entity.hpp"
#include "../../../node_modules/node-addon-api/napi.h"
class Circle;
class Player: public Entity {
public:
    Player(Game * gamePointer);
};