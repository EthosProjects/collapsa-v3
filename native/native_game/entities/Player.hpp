#pragma once
#include "Entity.hpp"
class Circle;
namespace Collapsa {
    class Player: public Entity {
        std::string socketid;
        std::string username;
        class Viewport {
            Game* p_game;
        public:
            Vector::Double center { 0, 0 };
            int width { 0 };
            int height { 0 };
            std::set<int> playerIDs;
            int** update ();
            std::set<int>* animate ();
            Viewport (Game* t_p_game): p_game(t_p_game) {};
        };
        Viewport viewport;
    public:
        Player(Game* t_p_game, std::string t_socketid, std::string t_username, int t_id, int t_entityid);
        void populateAABB(int* x1, int* y1, int* x2, int* y2) override;
        void update(long long t_nanoseconds);
        void updateViewport();
        void animateViewport();
        int8_t movement[5] { 0 };
        bool animated { 0 };
    };
}