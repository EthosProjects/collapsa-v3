#include <stdint.h>
#include <algorithm>
class Game;
#include "../quadtree/Quadtree.hpp"
class Damage {
    int16_t type;
    int16_t amount;
    int32_t length;
    int64_t start;
public: 
    Damage(int16_t initialType, int16_t initialAmount, int32_t initialLength, int64_t initialStart): 
        type(initialType),
        amount(initialAmount),
        length(initialLength),
        start(initialStart) {}
};
class HealthOptions {
public:
    int minimum;
    int maximum;
    HealthOptions(int min, int max):minimum(min), maximum(max) {}
};
class HealthController {
    int minimum;
    int maximum;
    int value;
public:
    void setHealth(int newHealth){
        newHealth = std::min(newHealth, maximum);
        newHealth = std::max(newHealth, minimum);
        value = newHealth;
    }
    int getHealth(){ return value; };
    HealthController(HealthOptions healthOpts){
        minimum = healthOpts.minimum;
        maximum = healthOpts.maximum;
    };
};
class Entity {
protected:
    HealthController health;
    IBody body;
protected:
    Game * game;
public:
    Entity(Position initialPosition, HealthOptions healthOpts, Game * gamePointer): 
        health(healthOpts), 
        game(gamePointer)
    {
        body.setPosition(initialPosition);
        //game->PrintValue("help");
    };
};