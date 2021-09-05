#include "Tree.hpp"
#include "../Game.hpp"
std::default_random_engine treePosGenerator;
std::uniform_int_distribution<int> treePosDistribution(70, 953);
auto ranTreePos = std::bind(treePosDistribution, treePosGenerator);
namespace Collapsa {
    Tree::Tree(Game* t_p_game, int t_id, int t_entityid): Entity(Health(0, 20), t_p_game, t_entityid) {
        is = constants::TREE::TYPE;
        p_body = new Body::Circle(110, Vector::Double(ranTreePos(), ranTreePos(), 70, 953, 70, 953));
        this->id = t_id;
    }
    void Tree::populateAABB(int* x1, int* y1, int* x2, int* y2) {
        *x1 = (double) p_body->position.x - 70;
        *y1 = (double) p_body->position.y - 70;
        *x2 = (double) p_body->position.x + 70;
        *y2 = (double) p_body->position.y + 70;
    };
    void Tree::writeMessage(Writer& t_writer, uint8_t t_messageType) {
        switch(t_messageType) {
            case constants::MSG_TYPES::ADD_ENTITY: 
                t_writer.writeUint8(id)
                    .writeUint16((double) p_body->position.x, false)
                    .writeUint16((double) p_body->position.y, false);
                break;
            case constants::MSG_TYPES::REMOVE_ENTITY:
                t_writer.writeUint8(id);
                break;
        }
    };
}