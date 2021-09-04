#include "Tree.hpp"
#include "../Game.hpp"
std::default_random_engine treePosGenerator;
std::uniform_int_distribution<int> treePosDistribution(110, 145);
auto ranTreePos = std::bind(treePosDistribution, treePosGenerator);
namespace Collapsa {
    Tree::Tree(Game* t_p_game, int t_id, int t_entityid): Entity(Health(0, 20), t_p_game, t_entityid) {
        is = constants::TREE::TYPE;
        p_body = new Body::Circle(110, Vector::Double(ranTreePos(), ranTreePos(), 110, 145, 110, 145));
        this->id = t_id;
    }
    void Tree::populateAABB(int* x1, int* y1, int* x2, int* y2) {
        *x1 = (double) p_body->position.x - 110;
        *y1 = (double) p_body->position.y - 110;
        *x2 = (double) p_body->position.x + 110;
        *y2 = (double) p_body->position.y + 110;
    };
}