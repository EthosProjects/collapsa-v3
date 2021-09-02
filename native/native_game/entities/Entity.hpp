#pragma once
#include "../include.hpp"
#include "../Controllers.hpp"
namespace Collapsa {
    namespace quadtree {
        struct Quadtree;
    };
    class Game;
    class Entity {
    public:
        Health health;
        Body::IBody* p_body;
        volatile int is;
    protected:
        Game * p_game;
    public:
        Entity(Health t_healthOptions, Game* t_p_game, int t_entityid): 
            health(t_healthOptions),
            p_game(t_p_game),
            entityid(t_entityid)
        {};
        virtual void populateAABB(int*, int*, int*, int*) = 0;
        uint16_t id;
        uint16_t entityid; 
    };
}