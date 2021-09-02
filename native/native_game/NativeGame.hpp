#define USING_NAPI
#include "Game.hpp"
namespace Collapsa {
    class NativeGame: public Game {
    public:
        NativeGame() : Game() {};
        void simJoin() {
            m_p_inputMessages_mutex.lock();
            m_p_inputMessages.push_back(new InputMessage(
                new uint8_t[17] {0}, 
                17,
                (std::string) "sdasdsadas"
            ));
            m_p_inputMessages_mutex.unlock();
        };
        void quickSert(int a) {
            Player* newPlayer = new Player(this, std::string{ "" }, std::string{ "" }, a, a);
            array_p_players[a] = newPlayer;
            array_p_entities[a] = newPlayer;
            qtree.insert(newPlayer);
        };
    };
};