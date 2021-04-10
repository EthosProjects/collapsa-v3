#include "Game.hpp"

void Game::exportMethods(Napi::Env env, Napi::Object exports) {
    Napi::Object gameExport = Napi::Object::New(env);
    gameExport.Set("bindClassToNative", Napi::Function::New(env, Game::bindClassToNative));
    gameExport.Set("bindInstanceToNative", Napi::Function::New(env, Game::bindInstanceToNative));
    exports.Set("NativeGame", gameExport);
}
Napi::Value Game::bindClassToNative(const Napi::CallbackInfo & info){
    Napi::Env env = info.Env();
    info[0].As<Napi::Object>().Get("prototype").As<Napi::Object>().Set("NativeBound", Napi::Boolean::New(env, 0));
    return env.Undefined();
}
Napi::Value Game::bindInstanceToNative(const Napi::CallbackInfo & info){
    Napi::Env env = info.Env();
    Napi::Object gameObj = info[0].As<Napi::Object>();
    Game * game = new Game(gameObj, env);
    return env.Undefined();
}
Napi::Value Game::addMessage(const Napi::CallbackInfo & info){
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
    m_p_inputMessages.push_back(new Message(reinterpret_cast<uint8_t*>(message.Data()), socket));
    std::cout << "Reading Message" << std::endl;
    return env.Undefined();
};
void Game::loop(){
    while(m_running){
        readMessages();
        update();
        sendMessages();
    }
    std::cout << "Terminated Game loop" << std::endl;
    return;
};
void Game::startLoop(){ m_running = true; m_loopThread = std::thread(&Game::loop, this); };
void Game::stopLoop(){ m_running = false; m_loopThread.join();};
void Game::readMessages(){};
void Game::update(){};
void Game::sendMessages(){
    for(std::vector<Message*>::iterator ppMessage = m_p_inputMessages.begin(); ppMessage < m_p_inputMessages.end(); ppMessage++){
        Message* pMessage = *ppMessage;
        switch(pMessage->data[0]) {
            case constants::MSG_TYPES::JOIN_GAME: {
                std::cout << "Processing join game message" << std::endl;
                std::cout << "Processed join game message"<< std::endl;
                break;
            }
            default: {
                std::cout << "Unknown Message " << pMessage->data[0] << std::endl;
            }
        }
        std::cout << "Processed message" << std::endl;
        delete pMessage;
    }
    m_p_inputMessages.clear();
};
Game::Game(Napi::Object gameObject, Napi::Env env): qtree(4, 5, 6, 5) {
    for(size_t i = 0; i < 255; i++) m_Players[i] = nullptr;
    auto fp = std::bind(&Game::addMessage, this, std::placeholders::_1);
    gameObject.Set("address", Napi::Number::New(env, (int) this));
    gameObject.Set("addMessage", Napi::Function::New(env, fp));
    startLoop();
};