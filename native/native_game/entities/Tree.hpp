#pragma once
#include "Entity.hpp"
class Circle;
namespace Collapsa {
    class Tree: public Entity {
    public:
        Tree(Game* t_p_game, int t_id, int t_entityid);
        void populateAABB(int* x1, int* y1, int* x2, int* y2) override;
        void update(long long t_nanoseconds);
        void writeMessage(Writer& t_writer, uint8_t t_messageType);
    };
}