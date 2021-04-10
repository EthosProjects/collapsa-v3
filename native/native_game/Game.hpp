#pragma once
#include "../../node_modules/node-addon-api/napi.h"
#include <string>
//#include "../native_emitter/NativeEmitter.hpp"
#include "quadtree/Quadtree.hpp"
#include "entities/Player.hpp"
#include <iostream>
#include <thread>
class Message {
public:
    uint8_t * data;
    Napi::Object socket;
    Message(uint8_t * message, Napi::Object socketLoad): data(message), socket(socketLoad){};
};
class Game {
    std::atomic<bool> running;
    Player * Players[255];
    std::vector<Message*> messages;
    std::thread loopThread;
    Napi::Object gameObject;
public:
    Game(Napi::Object gameObj, Napi::Env env); 
    ~Game(){
        std::cout << "Game destroyed" << std::endl;
    }
    static Napi::Function* pConstructor;
    static void Export(Napi::Env env, Napi::Object exports);
    static Napi::Value BindClassToNative(const Napi::CallbackInfo& info);
    static Napi::Value BindInstanceToNative(const Napi::CallbackInfo& info);
    Napi::Value AddMessage(const Napi::CallbackInfo& info);
    void ReadMessages();
    void Update();
    void SendMessages();
    void startLoop();
    void stopLoop();
    void loop();
    Napi::Value KillPlayer(const Napi::CallbackInfo& info);
    void PrintValue(std::string str){
        std::cout << str << std::endl;
    };
    Quadtree qtree;
};