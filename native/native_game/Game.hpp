#pragma once
#include "napi.h"
#include <string>
//#include "../native_emitter/NativeEmitter.hpp"
#include "quadtree/Quadtree.hpp"
#include "entities/Player.hpp"
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
        std::atomic<bool> m_running;
        std::vector<InputMessage*> m_p_inputMessages;
        std::vector<OutputMessage*> m_p_outputMessages;
        std::mutex m_p_inputMessages_mutex;
        std::mutex m_p_outputMessages_mutex;
        std::map<std::string, Player*> m_p_socketPlayerMap;
        std::thread m_loopThread;
        Player * m_Players[constants::PLAYER::LIMIT];
        Entity * m_entities[constants::PLAYER::LIMIT];
    public:
        int playerCount;
        Game(Napi::Object t_gameObject, Napi::Env t_env); 
        ~Game(){
            std::cout << "Game destroyed" << std::endl;
        }
        static void exportMethods(Napi::Env env, Napi::Object exports);
        static Napi::Value bindClassToNative(const Napi::CallbackInfo& info);
        static Napi::Value bindInstanceToNative(const Napi::CallbackInfo& info);
        Napi::Value writeMessage(const Napi::CallbackInfo& info);
        void readMessages();
        Napi::Value getMessages(const Napi::CallbackInfo& info);
        void update();
        void startLoop();
        Napi::Value startLoop(const Napi::CallbackInfo& info);
        void stopLoop();
        Napi::Value stopLoop(const Napi::CallbackInfo& info);
        void loop();
        Quadtree qtree;
    };

};