#define USING_NAPI
#include "Game.hpp"
namespace Collapsa {
    class NativeGame: public Game {
    public:
        NativeGame() : Game() {};
        void simJoin() {
            m_p_inputMessages_mutex.lock();
            m_p_inputMessages.push_back(new InputMessage(
                new uint8_t[1] {0}, 
                (std::string) "sdasdsadas"
            ));
            std::cout << "simming join\n";
            m_p_inputMessages_mutex.unlock();
        };
    };
};