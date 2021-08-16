#pragma once
#include "Entity.hpp"
#include "../../../node_modules/node-addon-api/napi.h"
class Circle;
namespace Collapsa {
    class Player: public Entity {
    public:
        std::string socketid;
        std::string username;
        class Viewport {
        public:
            Vector::Double center { 0, 0 };
            int width { 0 };
            int height { 0 };
            Game* p_game;
            std::set<int> playerIDs;
            int** update ();
            Viewport (Game* t_p_game): p_game(t_p_game) {};
        };
        Player(Game* t_p_game, std::string t_socketid, std::string t_username, int t_id, int t_entityid);
        void populateAABB(int* x1, int* y1, int* x2, int* y2) override;
        void update(long long t_nanoseconds);
        void updateViewport();
        int8_t movement[5] { 0 };
        Viewport viewport;
    };
}