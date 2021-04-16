#include "Game.hpp"
#include "napi.h"
namespace Collapsa {
    class NapiGame: public Game {
    public:
        static void exportMethods(Napi::Env env, Napi::Object exports);
        static Napi::Value bindClassToNative(const Napi::CallbackInfo& info);
        static Napi::Value bindInstanceToNative(const Napi::CallbackInfo& info);
        Napi::Value writeMessage(const Napi::CallbackInfo& info);
        Napi::Value getMessages(const Napi::CallbackInfo& info);
        Napi::Value startLoop(const Napi::CallbackInfo& info);
        Napi::Value stopLoop(const Napi::CallbackInfo& info);
        NapiGame(Napi::Object t_gameObject, Napi::Env t_env);
    };
};