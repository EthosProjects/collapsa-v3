#include "include.hpp"
#include "../quadtree/Quadtree.hpp"
namespace Collapsa {
    class Game;
    
    namespace Health {
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
        class Options {
        public:
            int minimum;
            int maximum;
            Options(int t_minimum, int t_maximum):minimum(t_minimum), maximum(t_maximum) {}
        };
        class Controller {
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
            Controller(Options t_option){
                m_maximum = t_option.maximum;
                m_minimum = t_option.minimum;
            };
        };
    }
    class Entity {
    protected:
        Health::Controller m_health;
        IBody m_body;
    protected:
        Game * m_p_game;
    public:
        Entity(Position t_position, Health::Options t_healthOptions, Game* t_p_game): 
            m_health(t_healthOptions), 
            m_p_game(t_p_game)
        {
            m_body.setPosition(t_position);
            //game->PrintValue("help");
        };
    };
}