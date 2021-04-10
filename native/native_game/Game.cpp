#include "Game.hpp"
#include <iostream>
#include <ctime>
#include <chrono>
#include <thread>
void Game::Export(Napi::Env env, Napi::Object exports) {
    Napi::Object gameExport = Napi::Object::New(env);
    gameExport.Set("bindToClass", Napi::Function::New(env, Game::BindToClass));
    gameExport.Set("bindInstanceToNative", Napi::Function::New(env, Game::BindInstanceToNative));
    exports.Set("NativeGame", gameExport);
}
Napi::Value Game::BindToClass(const Napi::CallbackInfo & info){
    Napi::Env env = info.Env();
    info[0].As<Napi::Object>().Get("prototype").As<Napi::Object>().Set("NativeBound", Napi::Boolean::New(env, 0));
    return env.Undefined();
}
Napi::Value Game::BindInstanceToNative(const Napi::CallbackInfo & info){
    Napi::Env env = info.Env();
    Napi::Object gameObj = info[0].As<Napi::Object>();
    Game * game = new Game(gameObj, env);
    return env.Undefined();
}
Napi::Value Game::AddMessage(const Napi::CallbackInfo & info){
    Napi::Env env = info.Env();
    if (!info[0].IsArrayBuffer()) {
        Napi::Error::New(info.Env(), "Expected a Buffer").ThrowAsJavaScriptException();
        return info.Env().Undefined();
    }
    if (!info[1].IsObject()) {
        Napi::Error::New(info.Env(), "Expected an Object").ThrowAsJavaScriptException();
        return info.Env().Undefined();
    }
    Napi::ArrayBuffer message = info[0].As<Napi::ArrayBuffer>();
    Napi::Object socket = info[1].As<Napi::Object>();
    messages.push_back(new Message(reinterpret_cast<uint8_t*>(message.Data()), socket));
    return env.Undefined();
};
void Game::loop(){
    clock_t start, end;
    start = clock();
    ReadMessages();
    Update();
    SendMessages();
    end = clock();
    double cpu_time_used = ((double) (end - start)) / CLOCKS_PER_SEC * 1000000;
    //std::cout << "game loop took " << cpu_time_used << " microseconds to execute" << std::endl;
    if(running) loop();
    else {
        std::cout << "Terminated Game loop" << std::endl;
    };
};
void Game::startLoop(){ loopThread = std::thread(&Game::loop, this); };
void Game::stopLoop(){ running = false; loopThread.join();};
void Game::ReadMessages(){};
void Game::Update(){};
void Game::SendMessages(){};
Game::Game(Napi::Object gameObj, Napi::Env env): gameObject(gameObj), qtree(4, 5, 6, 5) {
    for(size_t i = 0; i < 255; i++) Players[i] = nullptr;
    auto fp = std::bind(&Game::AddMessage, this, std::placeholders::_1);
    gameObj.Set("address", Napi::Number::New(env, (int) this));
    gameObj.Set("addMessage", Napi::Function::New(env, fp));
    running = true;
    startLoop();
    std::this_thread::sleep_for(std::chrono::seconds());
    stopLoop();
    /*
    Players[0] = new Player(this);
    Circle circ = Circle();
    qtree.insert(circ);*/
};