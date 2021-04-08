#include "Game.hpp"
#include <iostream>
Napi::Value Game::BindToClass(const Napi::CallbackInfo & info){
    Napi::Env env = info.Env();
    if(info.Length() != 1) std::cout << "Invalid argument list" << std::endl;
    Napi::Object constructorObj = info[0].As<Napi::Object>();
    constructorObj.Get("prototype").As<Napi::Object>().Set("red", Napi::String::New(env, "blue"));
    return env.Undefined();
}
Napi::Value Game::BindInstanceToNative(const Napi::CallbackInfo & info){
    Napi::Env env = info.Env();
    if(info.Length() != 1) std::cout << "Invalid argument count" << std::endl;
    Napi::Object gameObj = info[0].As<Napi::Object>();
    Game * game = new Game();
    gameObj.Set("address", Napi::String::New(env, std::to_string((long) game)));
    return env.Undefined();
}
Game::Game(): qtree(4, 5, 6, 5) {
    Players[0] = new Player(this);
    Circle circ = Circle();
    qtree.insert(circ);
};