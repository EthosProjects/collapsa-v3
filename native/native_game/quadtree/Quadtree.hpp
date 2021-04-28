#pragma once
#include "FreeList.hpp"
#include <cstdint>
#include <set>
#include "../Controllers.hpp"
#include "../entities/Entity.hpp"

namespace Collapsa {
    namespace quadtree {
        struct QuadNode{
            int32_t first_child{ -1 };
            bool divided { 0 };
        };
        // Represents an element in the quadtree.
        struct QuadElt {
            // Stores the ID for the element (can be used to refer to external data).
            int id;

            // Stores the rectangle for the element.
            int x1, y1, x2, y2;
        };

        // Represents an element node in the quadtree.
        struct QuadEltNode {
            // Points to the next element in the leaf node. A value of -1 indicates the end of the list.
            int next { -1 };
            // Stores the element index.
            int element;
        };

        struct Quadtree {
            
            // Stores all the elements in the quadtree.
            FreeList<QuadElt> elts;

            // Stores all the element nodes in the quadtree.
            FreeList<QuadEltNode> elt_nodes;

            // Stores all the nodes in the quadtree. The first node in this
            // sequence is always the root.
            std::vector<QuadNode> nodes;
            void insert(Collapsa::Entity*);
            void moveEltNodeTo(int, int);
            void clear();
            std::set<int> query(int t_x1, int t_y1, int t_x2, int t_y2);
            // Stores the quadtree extents.
            int root_rect[4];

            // Stores the first free node in the quadtree to be reclaimed as 4
            // contiguous nodes at once. A value of -1 indicates that the free
            // list is empty, at which point we simply insert 4 nodes to the
            // back of the nodes array.
            int free_node;

            // Stores the maximum depth allowed for the quadtree.
            int max_depth;
            Quadtree(int x1, int y1, int x2, int y2);
        };

    };
};