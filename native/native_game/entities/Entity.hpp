#pragma once
#include "../include.hpp"
#include "../Controllers.hpp"
namespace Collapsa {
    namespace quadtree {
        class Quadtree;
    };
    class Game;
    class Entity {
    public:
        Health::Controller health;
        Body::IBody* body;
        volatile int is;
    protected:
        Game * m_p_game;
    public:
        Entity(Health::Options t_healthOptions, Game* t_p_game, int t_entityid): 
            health(t_healthOptions),
            m_p_game(t_p_game),
            entityid(t_entityid)
        {};
        virtual void populateAABB(int*, int*, int*, int*) = 0;
        uint16_t id;
        uint16_t entityid; 
    };
}