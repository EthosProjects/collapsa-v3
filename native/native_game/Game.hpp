#pragma once
//#include "../native_emitter/NativeEmitter.hpp"
#include "entities/Player.hpp"
#include "quadtree/Quadtree.hpp"
#include "constants.hpp"
namespace Collapsa {
    class OutputMessage {
    public:
        std::string socketid;
        uint8_t* data;
        uint16_t dataLength;
        OutputMessage(uint8_t* t_data, std::string t_socketid, uint16_t t_dataLength): data(t_data), socketid(t_socketid), dataLength(t_dataLength) {};
        ~OutputMessage(){
            std::cout << "Destructed output message but didn't free buffer";
        }
    };
    class InputMessage {
    public:
        std::string socketid;
        uint8_t * data;
        InputMessage(uint8_t* t_data, std::string t_socketid): data(t_data), socketid(t_socketid){};
    };
    class Game {
    protected:
        std::atomic<bool> m_running;
        std::vector<InputMessage*> m_p_inputMessages;
        std::vector<OutputMessage*> m_p_outputMessages;
        std::mutex m_p_inputMessages_mutex;
        std::mutex m_p_outputMessages_mutex;
        std::map<std::string, Player*> m_p_socketPlayerMap;
        std::thread m_loopThread;
        Player* m_Players[constants::PLAYER::LIMIT];
        Entity* m_entities[constants::PLAYER::LIMIT];
        quadtree::Quadtree m_quadtree;
    public:
        int playerCount;
        Game(); 
        ~Game(){
            std::cout << "Game destroyed" << std::endl;
        }
        void readMessages();
        void update();
        void startLoop();
        void stopLoop();
        void loop();
    };

};