#include "Quadtree.hpp"
#include <iostream>
namespace Collapsa {
    namespace quadtree {
        class QuadNodeData {
        public:
            int depth;
            int nodeIndex;
            int x1;
            int y1;
            int x2;
            int y2;
            QuadNodeData(int t_depth, int t_nodeIndex, int t_x1, int t_y1, int t_x2, int t_y2) :
                depth(t_depth),
                nodeIndex(t_nodeIndex),
                x1(t_x1),
                y1(t_y1),
                x2(t_x2),
                y2(t_y2)
            {};
        };
        Quadtree::Quadtree(int t_x1, int t_y1, int t_x2, int t_y2) {
            root_rect[0] = t_x1;
            root_rect[1] = t_y1;
            root_rect[2] = t_x2;
            root_rect[3] = t_y2;
            elts = FreeList<QuadElt>();
            elt_nodes = FreeList<QuadEltNode>();
            nodes = std::vector<QuadNode>();
            nodes.reserve(256);
            nodes.push_back(QuadNode());
        };
        std::set<int> Quadtree::query(int t_x1, int t_y1, int t_x2, int t_y2){
            std::set<int> entityList;
            std::vector<QuadNodeData> leaves;
            leaves.push_back(QuadNodeData{ 0, 0, root_rect[0], root_rect[1], root_rect[2], root_rect[3] });
            while (leaves.size() > 0) {
                QuadNodeData nData = leaves.back();
                if(nodes[nData.nodeIndex].divided) {
                    bool inTopHalf = t_y1 < (nData.y1 + nData.y2) / 2 && nData.y1 < t_y2;
                    bool inBottomHalf = t_y1 < nData.y2 && (nData.y1 + nData.y2) / 2 < t_y2;
                    bool inRightHalf = t_x1 < (nData.x1 + nData.x2) / 2 && nData.x1 < t_x2;
                    bool inLeftHalf = t_x1 < nData.x2 && (nData.x1 + nData.x2) / 2 < t_x2;
                    leaves.pop_back();
                    if(inTopHalf) {
                        if (inRightHalf) leaves.push_back(QuadNodeData{ nData.depth + 1, nodes[nData.nodeIndex].first_child + 0, nData.x1, nData.y1, (nData.x1 + nData.x2) / 2, (nData.y1 + nData.y2) / 2 });
                        if (inLeftHalf) leaves.push_back(QuadNodeData{ nData.depth + 1, nodes[nData.nodeIndex].first_child + 1, (nData.x1 + nData.x2) / 2, nData.y1, nData.x2, (nData.y1 + nData.y2) / 2 });
                    }
                    if (inBottomHalf) {
                        if (inRightHalf) leaves.push_back(QuadNodeData{ nData.depth + 1, nodes[nData.nodeIndex].first_child + 2, nData.x1, (nData.y1 + nData.y2) / 2, (nData.x1 + nData.x2) / 2, nData.y2 });
                        if (inLeftHalf) leaves.push_back(QuadNodeData{ nData.depth + 1, nodes[nData.nodeIndex].first_child + 3, (nData.x1 + nData.x2) / 2, (nData.y1 + nData.y2) / 2, nData.x2, nData.y2 });
                    }
                }else {
                    if (nodes[nData.nodeIndex].first_child == -1) { leaves.pop_back(); continue; };
                    int prevIndex = nodes[nData.nodeIndex].first_child;
                    while(true){
                        QuadElt qElt = elts[elt_nodes[prevIndex].element];
                        if(
                            t_y1 < qElt.y2 && qElt.y1 < t_y2 &&
                            t_x1 < qElt.x2 && qElt.x1 < t_x2
                        ) entityList.insert(qElt.id);
                        if (elt_nodes[prevIndex].next == -1) break;
                        prevIndex = elt_nodes[prevIndex].next;
                    }
                    leaves.pop_back();
                }
             }
            return entityList;
        };
        void Quadtree::insert(Collapsa::Entity* e) {
            QuadElt qElt = QuadElt();
            qElt.id = e->entityid;
            e->populateAABB(&qElt.x1, &qElt.y1, &qElt.x2, &qElt.y2);
            int elementId = elts.insert(qElt);
            int leavesLength = 0;
            std::vector<QuadNodeData> leaves;
            leaves.push_back(QuadNodeData{ 0, 0, root_rect[0], root_rect[1], root_rect[2], root_rect[3] });
            while (leaves.size() > 0) {
                QuadNodeData nData = leaves.back();
                int halfVertical = (nData.y1 + nData.y2) >> 1;
                int halfHorizontal = (nData.x1 + nData.x2) >> 1;
                if (nodes[nData.nodeIndex].divided) {
                    bool inTopHalf = qElt.y1 < halfVertical && nData.y1 < qElt.y2;
                    bool inBottomHalf = qElt.y1 < nData.y2 && halfVertical / 2 < qElt.y2;
                    bool inRightHalf = qElt.x1 < halfHorizontal && nData.x1 < qElt.x2;
                    bool inLeftHalf = qElt.x1 < nData.x2 && halfHorizontal < qElt.x2;
                    leaves.pop_back();
                    if(inTopHalf) {
                        if (inRightHalf) leaves.push_back(QuadNodeData{ nData.depth + 1, nodes[nData.nodeIndex].first_child + 0, nData.x1, nData.y1, halfHorizontal, halfVertical });
                        if (inLeftHalf) leaves.push_back(QuadNodeData{ nData.depth + 1, nodes[nData.nodeIndex].first_child + 1, halfHorizontal, nData.y1, nData.x2, halfVertical });
                    }
                    if (inBottomHalf) {
                        if (inRightHalf) leaves.push_back(QuadNodeData{ nData.depth + 1, nodes[nData.nodeIndex].first_child + 2, nData.x1, halfVertical, halfHorizontal, nData.y2 });
                        if (inLeftHalf) leaves.push_back(QuadNodeData{ nData.depth + 1, nodes[nData.nodeIndex].first_child + 3, halfHorizontal, halfVertical, nData.x2, nData.y2 });
                    }
                } else {
                    if (nodes[nData.nodeIndex].first_child == -1) {
                        QuadEltNode qEltNode = QuadEltNode();
                        qEltNode.element = elementId;
                        nodes[nData.nodeIndex].first_child = elt_nodes.insert(qEltNode);
                        leaves.pop_back();
                        continue;
                    };
                    int i = 1;
                    int prevIndex = nodes[nData.nodeIndex].first_child;
                    while (true) {
                        if (elt_nodes[prevIndex].next == -1) break;
                        prevIndex = elt_nodes[prevIndex].next;
                        i++;
                    }
                    if (i >= 8 && nData.depth != 4) {
                        int prevIndex = nodes[nData.nodeIndex].first_child;
                        int contiguousIndex = static_cast<int>(nodes.size());
                        nodes.push_back(QuadNode());
                        nodes.push_back(QuadNode());
                        nodes.push_back(QuadNode());
                        nodes.push_back(QuadNode());
                        nodes[nData.nodeIndex].first_child = contiguousIndex;
                        for (int i = 0; i < 8; i++) {
                            QuadElt qElt = elts[elt_nodes[prevIndex].element];
                            bool inTopHalf = qElt.y1 < halfVertical && nData.y1 < qElt.y2;
                            bool inBottomHalf = qElt.y1 < nData.y2 && halfVertical / 2 < qElt.y2;
                            bool inRightHalf = qElt.x1 < halfHorizontal && nData.x1 < qElt.x2;
                            bool inLeftHalf = qElt.x1 < nData.x2 && halfHorizontal < qElt.x2;
                            std::vector<int> childIndices = {};
                            if (inTopHalf) {
                                if (inRightHalf) moveEltNodeTo(contiguousIndex + 0, prevIndex);
                                if (inLeftHalf) moveEltNodeTo(contiguousIndex + 1, prevIndex);
                            }
                            if (inBottomHalf) {
                                if (inRightHalf) moveEltNodeTo(contiguousIndex + 2, prevIndex);
                                if (inLeftHalf) moveEltNodeTo(contiguousIndex + 3, prevIndex);
                            }
                            for (int nodeIndex : childIndices) moveEltNodeTo(contiguousIndex + nodeIndex, prevIndex);
                            int toErase = prevIndex;
                            prevIndex = elt_nodes[prevIndex].next;
                            elt_nodes.erase(toErase);
                        }
                        bool inTopHalf = qElt.y1 < halfVertical && nData.y1 < qElt.y2;
                        bool inBottomHalf = qElt.y1 < nData.y2 && halfVertical / 2 < qElt.y2;
                        bool inRightHalf = qElt.x1 < halfHorizontal && nData.x1 < qElt.x2;
                        bool inLeftHalf = qElt.x1 < nData.x2 && halfHorizontal < qElt.x2;
                        leaves.pop_back();
                        if (inTopHalf) {
                            if (inRightHalf) leaves.push_back(QuadNodeData{ nData.depth + 1, contiguousIndex + 0, nData.x1, nData.y1, halfHorizontal, halfVertical });
                            if (inLeftHalf) leaves.push_back(QuadNodeData{ nData.depth + 1, contiguousIndex + 1, halfHorizontal, nData.y1, nData.x2, halfVertical });
                        }
                        if (inBottomHalf) {
                            if (inRightHalf) leaves.push_back(QuadNodeData{ nData.depth + 1, contiguousIndex + 2, nData.x1, halfHorizontal, (nData.x1 + nData.x2) / 2, nData.y2 });
                            if (inLeftHalf) leaves.push_back(QuadNodeData{ nData.depth + 1, contiguousIndex + 3, halfHorizontal, (nData.y1 + nData.y2) / 2, nData.x2, nData.y2 });
                        }
                        nodes[nData.nodeIndex].divided = true;
                        continue;
                    }
                    QuadEltNode qEltNode = QuadEltNode();
                    qEltNode.element = elementId;
                    int n = elt_nodes.insert(qEltNode);
                    elt_nodes[prevIndex].next = n;
                    leaves.pop_back();
                }
            };
        };
        void Quadtree::moveEltNodeTo(int nodeIndex, int eltNodeIndex) {
            QuadEltNode qEltNode = QuadEltNode();
            qEltNode.element = elt_nodes[eltNodeIndex].element;
            if (nodes[nodeIndex].first_child == -1) {
                nodes[nodeIndex].first_child = elt_nodes.insert(qEltNode);
                return;
            };
            int i = 1;
            int prevIndex = nodes[nodeIndex].first_child;
            while (true) {
                if (elt_nodes[prevIndex].next == -1) break;
                prevIndex = elt_nodes[prevIndex].next;
                i++;
            }
            elt_nodes[prevIndex].next = elt_nodes.insert(qEltNode);
        };
        void Quadtree::clear(){
            elts.clear();
            elt_nodes.clear();
            nodes.clear();
            nodes.push_back(QuadNode());
        };
    }
}