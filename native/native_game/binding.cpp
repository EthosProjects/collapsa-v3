#include "NapiGame.hpp"
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    Collapsa::NapiGame::exportMethods(env, exports);
    return exports;
}
NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
