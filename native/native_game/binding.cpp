#include "Game.hpp"
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    Game::exportMethods(env, exports);
    return exports;
}
NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
