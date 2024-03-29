#include "NapiGame.hpp"
namespace Collapsa {
    void NapiGame::exportMethods(Napi::Env env, Napi::Object exports) {
        Napi::Object gameExport = Napi::Object::New(env);
        gameExport.Set("bindClassToNative", Napi::Function::New(env, NapiGame::bindClassToNative));
        gameExport.Set("bindInstanceToNative", Napi::Function::New(env, NapiGame::bindInstanceToNative));
        exports.Set("NativeGame", gameExport);
    }
    Napi::Value NapiGame::bindClassToNative(const Napi::CallbackInfo & info){
        Napi::Env env = info.Env();
        info[0].As<Napi::Object>().Get("prototype").As<Napi::Object>().Set("NativeBound", Napi::Boolean::New(env, 0));
        return env.Undefined();
    }
    Napi::Value NapiGame::bindInstanceToNative(const Napi::CallbackInfo & info){
        Napi::Env env = info.Env();
        Napi::Object gameObj = info[0].As<Napi::Object>();
        new NapiGame(gameObj, env);
        return env.Undefined();
    }
    Napi::Value NapiGame::writeMessage(const Napi::CallbackInfo & info){
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
        InputMessage* inputMessage = new InputMessage {
            new uint8_t[message.ByteLength()] { 0 },
            (uint32_t) message.ByteLength(), 
            (std::string) info[1].As<Napi::Object>().Get("id").As<Napi::String>()
        };
        uint8_t* arrayBufferData = reinterpret_cast<uint8_t*>(message.Data());
        for (size_t i = 0; i < inputMessage->byteLength; ++i) inputMessage->buffer[i] = arrayBufferData[i];
        pushInputMessage(inputMessage);
        return env.Undefined();
    };
    Napi::Value NapiGame::getMessages(const Napi::CallbackInfo& info){
        Napi::Env env = info.Env();
        Napi::Array buffArray = Napi::Array::New(env, m_p_outputMessages.size()).As<Napi::Array>();
        m_p_outputMessages_mutex.lock();
        unsigned int i = 0;
        for(OutputMessage* pOutputMessage: m_p_outputMessages){
            Napi::ArrayBuffer JSMessage = Napi::ArrayBuffer::New(env, pOutputMessage->byteLength);
            uint8_t* JSMessageData = reinterpret_cast<uint8_t*>(JSMessage.Data());
            for(unsigned int i = 0; i < pOutputMessage->byteLength; ++i) JSMessageData[i] = pOutputMessage->buffer[i];
            JSMessage.As<Napi::Object>().Set("socketid", Napi::String::New(env, pOutputMessage->socketid));
            buffArray[i] = JSMessage;
            delete pOutputMessage;
            ++i;
        }
        m_p_outputMessages.clear();
        m_p_outputMessages_mutex.unlock();
        return buffArray;
    }
    NapiGame::NapiGame(Napi::Object t_gameObject, Napi::Env t_env) {
        //t_gameObject.Set("address", Napi::Number::New(t_env, (int) this));
        t_gameObject.Set("writeMessage", Napi::Function::New(t_env, std::bind(&NapiGame::writeMessage, this, std::placeholders::_1)));
        t_gameObject.Set("getMessages", Napi::Function::New(t_env, std::bind(&NapiGame::getMessages, this, std::placeholders::_1)));
    }
};