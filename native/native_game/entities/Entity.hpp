#pragma once
#include "../include.hpp"
#include "../Controllers.hpp"
namespace Collapsa {
    class Game;
    class Entity {
    protected:
        Health::Controller m_health;
        Body::IBody* m_body;
        Game * m_p_game;
    public:
        Entity(Health::Options t_healthOptions, Game* t_p_game, int t_entityid): 
            m_health(t_healthOptions),
            m_p_game(t_p_game),
            entityid(t_entityid)
        {};
        virtual void populateAABB(int*, int*, int*, int*) = 0;
        int id;
        int entityid; 
    };
}