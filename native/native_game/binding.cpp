#include "Game.hpp"
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    //Game::Export(env, exports);
    exports.Set("bindToClass", Napi::Function::New(env, Game::BindToClass));
    exports.Set("bindInstanceToNative", Napi::Function::New(env, Game::BindInstanceToNative));
    return exports;
}
NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
