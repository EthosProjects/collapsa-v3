#pragma once
#include "FreeList.hpp"
struct QuadNode{
    int32_t first_child;
};

class Position {
    int x;
    int y;
public: 
    Position(int xPos, int yPos):x(xPos), y(yPos) {};
    virtual int getX(){ return x; };
    virtual int getY(){ return y; };
    virtual void setX(int val){ x = val; };
    virtual void setY(int val){ y = val; };
};
class IShape {
public:
    IShape() {};
    ~IShape() {};
    virtual bool interects(int rect[4]) = 0;
};
class Circle: public IShape {
public:
    Circle() {

    };
    ~Circle() {};
    bool interects(int rect[4]){
        return true;
    };
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
    int next;

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
    void insert(IShape & shape);
    // Stores the quadtree extents.
    int root_rect[4];

    // Stores the first free node in the quadtree to be reclaimed as 4
    // contiguous nodes at once. A value of -1 indicates that the free
    // list is empty, at which point we simply insert 4 nodes to the
    // back of the nodes array.
    int free_node;

    // Stores the maximum depth allowed for the quadtree.
    int max_depth;
    Quadtree(int x, int y, int w, int h);
};