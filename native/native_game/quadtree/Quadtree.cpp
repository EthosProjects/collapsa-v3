#include "Quadtree.hpp"
#include <iostream>
namespace Collapsa {
    namespace quadtree {
        Quadtree::Quadtree(int x, int y, int w, int h) {
            root_rect[0] = x;
            root_rect[1] = y;
            root_rect[2] = w/2;
            root_rect[3] = h/2;
            elts = FreeList<QuadElt>();
            elt_nodes = FreeList<QuadEltNode>();
            nodes = std::vector<QuadNode>();
            nodes.push_back(QuadNode());
            nodes[0].first_child = -1;
        };
        void Quadtree::insert(Collapsa::Entity* e){
            std::cout << "Adding Entity to tree" << std::endl;
            if (nodes[0].first_child == -1){
                QuadElt qElt = elts[elts.insert(QuadElt())];
                QuadEltNode qEltNode = elt_nodes[elt_nodes.insert(QuadEltNode())];
                nodes[0].first_child = 0;
                qElt.id = e->id;
                e->populateAABB(&qElt.x1, &qElt.y1, &qElt.x2, &qElt.y2);
                return;
            }
            int i = nodes[0].first_child;
            for(; i < 8; i++) {
                
            }
            std::cout << i << std::endl;
            std::cout << "Added second entity to tree" << std::endl;
        };
    }

}