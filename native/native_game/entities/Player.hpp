#pragma once
#include "Entity.hpp"
class IShape;
class Player: public Entity {
public:
    Player(Game * gamePointer);
};