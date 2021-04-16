#define USING_NAPI
#include "Game.hpp"
namespace Collapsa {
    class NativeGame: public Game {
    public:
        void simJoin() {
            int playerIndex = 0,
                entityIndex = 0;
            while (playerIndex < constants::PLAYER::LIMIT) { if (m_Players[playerIndex] == nullptr) break; ++playerIndex; };
            while (entityIndex < constants::PLAYER::LIMIT) { if (m_entities[entityIndex] == nullptr) break; ++entityIndex; };
            Player* newPlayer = new Player(this, "sdasdsadas", playerIndex, entityIndex);
            m_Players[playerIndex] = newPlayer;
            m_entities[entityIndex] = newPlayer;
            this->m_p_socketPlayerMap["sdasdsadas"] = newPlayer;
            playerCount++;
            m_quadtree.insert(newPlayer);
        };
    };
};