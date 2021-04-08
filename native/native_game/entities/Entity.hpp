#include <stdint.h>
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
class Entity {
protected:
    Position position;
    Position prevPosition;
    int health;
    Game * game;
public:
    Entity(Position initialPosition, int initialHealth, Game * gamePointer): 
        position(initialPosition), 
        prevPosition(Position(initialPosition.getX(), initialPosition.getY())), 
        health(initialHealth), 
        game(gamePointer)
    {
        //game->PrintValue("help");
    };
};