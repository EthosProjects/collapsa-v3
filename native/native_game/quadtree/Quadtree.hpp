#pragma once
#include "FreeList.hpp"
struct QuadNode{
    int32_t first_child;
};
class Position {
    int m_x;
    int m_y;
public: 
    Position(int t_x, int t_y):m_x(t_x), m_y(t_y) {};
    Position():m_x(0), m_y(0) {};
    virtual int getX(){ return m_x; };
    virtual int getY(){ return m_y; };
    virtual void setX(int val){ m_x = val; };
    virtual void setY(int val){ m_y = val; };
};
class IShape {
public:
    IShape() {};
    ~IShape() {};
    virtual bool intersects(int rect[4]) = 0;
};
class IBody: public IShape {
public:
    void setPosition(Position newPos){
        prevPosition.setX(position.getX());
        prevPosition.setY(position.getY());
        position.setX(newPos.getX());
        position.setY(newPos.getY());
    }
    IBody() {};
    ~IBody() {};
    bool intersects(int rect[4]){
        return true;
    };
protected:
    Position position;
    Position prevPosition;
};
class Circle: public IBody {
public:
    Circle() {

    };
    ~Circle() {};
    bool intersects(int rect[4]){
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