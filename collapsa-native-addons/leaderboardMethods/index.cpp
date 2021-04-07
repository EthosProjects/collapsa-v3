#include <napi.h>
#include <iostream>
#include "quicksort.h"

using namespace std;
static Napi::Value sortPlayers(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::ArrayBuffer buf = info[0].As<Napi::ArrayBuffer>();
    leaderboardSlot * leaderboard = reinterpret_cast<leaderboardSlot*>(buf.Data());
    size_t leaderboardLength = buf.ByteLength() / sizeof(leaderboardSlot);
    quicksort(leaderboard, 0, leaderboardLength - 1);
    return buf;
}
static Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(
        Napi::String::New(env, "sortPlayers"),
        Napi::Function::New(env, sortPlayers)
    );
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)