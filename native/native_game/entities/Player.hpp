#pragma once
#include "Entity.hpp"
class Circle;
namespace Collapsa {
    class Inventory {
        int8_t items[9][2] { 0 };
        bool changed { 0 };
    };
    class Player: public Entity {
        std::string username;
        class Viewport {
            Game* p_game;
        public:
            Vector::Double center { 0, 0 };
            int width { 0 };
            int height { 0 };
            std::set<int> playerIDs;
            std::set<int> treeIDs;
            int** update ();
            std::set<int>* animate ();
            Viewport (Game* t_p_game): p_game(t_p_game) {};
        };
        Viewport viewport;
    public:
        std::string socketid;
        Player(Game* t_p_game, std::string t_socketid, std::string t_username, int t_id, int t_entityid);
        void populateAABB(int* x1, int* y1, int* x2, int* y2) override;
        void update(long long t_nanoseconds);
        void updateViewport();
        void animateViewport();
        void writeMessage(Writer& t_writer, uint8_t t_messageType);
        int8_t movement[5] { 0 };
        bool animated { 0 };
        Inventory inventory;
    };
}