#pragma once
#include "../../node_modules/node-addon-api/napi.h"
#include <string>
//#include "../native_emitter/NativeEmitter.hpp"
#include "quadtree/Quadtree.hpp"
#include "entities/Player.hpp"
#include "constants.hpp"
#include <iostream>
#include <ctime>
#include <chrono>
#include <thread>
#include <cstdint>
class OutputMessage {

};
class Message {
public:
    uint8_t * data;
    Napi::Object socket;
    Message(uint8_t * message, Napi::Object socketLoad): data(message), socket(socketLoad){};
};
class Game {
    std::atomic<bool> m_running;
    std::vector<Message*> m_p_inputMessages;
    std::mutex m_p_inputMessages_mutex;
    std::thread m_loopThread;
    Player * m_Players[255];
public:
    int playerCount;
    Game(Napi::Object t_gameObject, Napi::Env t_env); 
    ~Game(){
        std::cout << "Game destroyed" << std::endl;
    }
    static void exportMethods(Napi::Env env, Napi::Object exports);
    static Napi::Value bindClassToNative(const Napi::CallbackInfo& info);
    static Napi::Value bindInstanceToNative(const Napi::CallbackInfo& info);
    Napi::Value addMessage(const Napi::CallbackInfo& info);
    void readMessages();
    void update();
    void startLoop();
    void stopLoop();
    void loop();
    Quadtree qtree;
};