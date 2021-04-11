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
    int m_maximum;
    int m_minimum;
    int m_value;
public:
    void setHealth(int t_health){
        t_health = std::min(t_health, m_maximum);
        t_health = std::max(t_health, m_minimum);
        m_value = t_health;
    }
    int getHealth(){ return m_value; };
    HealthController(HealthOptions healthOpts){
        m_maximum = healthOpts.maximum;
        m_minimum = healthOpts.minimum;
    };
};
class Entity {
protected:
    HealthController m_health;
    IBody m_body;
protected:
    Game * m_p_game;
public:
    Entity(Position t_position, HealthOptions t_healthOptions, Game* t_p_game): 
        m_health(t_healthOptions), 
        m_p_game(t_p_game)
    {
        m_body.setPosition(t_position);
        //game->PrintValue("help");
    };
};