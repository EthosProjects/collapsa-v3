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
Napi::Value Game::writeMessage(const Napi::CallbackInfo & info){
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
    m_p_inputMessages_mutex.lock();
    m_p_inputMessages.push_back(new InputMessage(
        reinterpret_cast<uint8_t*>(message.Data()), 
        (std::string) info[1].As<Napi::Object>().Get("id").As<Napi::String>()
    ));
    m_p_inputMessages_mutex.unlock();
    //std::cout << "Reading Message" << std::endl;
    return env.Undefined();
};
Napi::Value Game::getMessages(const Napi::CallbackInfo& info){
    Napi::Env env = info.Env();
    Napi::Array buffArray = Napi::Array::New(env, m_p_outputMessages.size()).As<Napi::Array>();
    m_p_outputMessages_mutex.lock();
    unsigned int i = 0;
    for(OutputMessage* ppOutputMessage: m_p_outputMessages){
        buffArray[i] = Napi::ArrayBuffer::New(env, (void*) ppOutputMessage->data, ppOutputMessage->dataLength);
        ++i;
    }
    m_p_outputMessages.clear();
    m_p_outputMessages_mutex.unlock();
    return buffArray;
}
void Game::loop(){
    while(m_running){
        readMessages();
        update();
    }
    std::cout << "Terminated Game loop" << std::endl;
    return;
};
void Game::startLoop(){ m_running = true; m_loopThread = std::thread(&Game::loop, this); };
void Game::stopLoop(){ m_running = false; m_loopThread.join();};
void Game::readMessages(){
    m_p_inputMessages_mutex.lock();
    for(std::vector<InputMessage*>::iterator ppMessage = m_p_inputMessages.begin(); ppMessage < m_p_inputMessages.end(); ppMessage++){
        InputMessage* pMessage = *ppMessage;
        std::cout << "Processing message" << std::endl;
        switch(pMessage->data[0]) {
            case constants::MSG_TYPES::JOIN_GAME: {
                std::cout << "Processing join game message" << std::endl;
                if(playerCount == constants::PLAYER::LIMIT){
                    //Create a "Game full message"
                    break;
                }
                size_t i = 0;
                while(i < constants::PLAYER::LIMIT){
                    if(m_Players[i] == nullptr) break;
                    ++i;
                };
                m_Players[i] = new Player(this, pMessage->socketid);
                this->m_p_socketPlayerMap[pMessage->socketid] = m_Players[i];
                playerCount++;
                OutputMessage *newPlayerMessage = new OutputMessage{ new uint8_t[3], pMessage->socketid, 3 };
                m_p_outputMessages_mutex.lock();
                m_p_outputMessages.push_back(newPlayerMessage);
                m_p_outputMessages_mutex.unlock();
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
    m_p_inputMessages_mutex.unlock();
};
void Game::update(){};
Game::Game(Napi::Object gameObject, Napi::Env env): 
    qtree(4, 5, 6, 5),
    playerCount(0)
{
    for(size_t i = 0; i < 255; i++) m_Players[i] = nullptr;
    std::cout << (m_Players[0] != nullptr) << std::endl;
    gameObject.Set("address", Napi::Number::New(env, (int) this));
    gameObject.Set("writeMessage", Napi::Function::New(env, [this](Napi::CallbackInfo& info){ return writeMessage(info); }));
    gameObject.Set("getMessages", Napi::Function::New(env, [this](Napi::CallbackInfo& info){ return getMessages(info); }));
    startLoop();
};