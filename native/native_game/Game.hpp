#pragma once
#include "../../node_modules/node-addon-api/napi.h"
#include <string>
//#include "../native_emitter/NativeEmitter.hpp"
#include "quadtree/Quadtree.hpp"
#include "entities/Player.hpp"
#include <iostream>
class Game {
    Player * Players[255];
public:
    Game(); 
    static Napi::Value BindToClass(const Napi::CallbackInfo& info);
    static Napi::Value BindInstanceToNative(const Napi::CallbackInfo& info);
    void PrintValue(std::string str){
        std::cout << str << std::endl;
    };
    Quadtree qtree;
};