#include "Quadtree.hpp"
#include <iostream>
Quadtree::Quadtree(int x, int y, int w, int h) {
    root_rect[0] = x;
    root_rect[1] = y;
    root_rect[2] = w/2;
    root_rect[3] = h/2;
    elts = FreeList<QuadElt>();
    elt_nodes = FreeList<QuadEltNode>();
    nodes = std::vector<QuadNode>();
};
void Quadtree::insert(IShape &shape){
    if(shape.interects(root_rect)){
        std::cout << "Poggers" << std::endl;
    }
};