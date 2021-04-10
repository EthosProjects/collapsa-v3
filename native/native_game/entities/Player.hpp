#pragma once
#include "Entity.hpp"
#include "../../../node_modules/node-addon-api/napi.h"
class Circle;
class Player: public Entity {
public:
    static void Export(Napi::Env env, Napi::Object exports);
    static Napi::Value BindToClass(const Napi::CallbackInfo& info);
    static Napi::Value BindInstanceToNative(const Napi::CallbackInfo& info);
    Player(Game * gamePointer);
};