#include <chrono>
#include <iostream>
#include <thread>

#include "NativeEmitter.hpp"

Napi::FunctionReference NativeEmitter::constructor;

Napi::Object NativeEmitter::Export(Napi::Env env, Napi::Object exports) {
    Napi::Function func =
        DefineClass(
            env,
            "NativeEmitter",
            {
                InstanceMethod(
                    "callAndEmit", 
                    &NativeEmitter::CallAndEmit
                )
            }
        );
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("NativeEmitter", func);
    return exports;
}
NativeEmitter::NativeEmitter(const Napi::CallbackInfo& info): Napi::ObjectWrap<NativeEmitter>(info), id(2) {}

Napi::Value NativeEmitter::CallAndEmit(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    EmitEvent(info, "help", "why");
    std::cout << id << std::endl;
    id = 3;
    Napi::Function emit = info.This().As<Napi::Object>().Get("emit").As<Napi::Function>();
    EmitEvent(info, "start");
    for (int i = 0; i < 3; i++) {
        std::this_thread::sleep_for(std::chrono::seconds(1));
        EmitEvent(info, "data", "data ...");
    }
    EmitEvent(info, "end");
    return Napi::String::New(env, "OK");
}
void NativeEmitter::EmitEvent(const Napi::CallbackInfo& info, std::string eventName) {
    Napi::Function emit = info.This().As<Napi::Object>().Get("emit").As<Napi::Function>();
    emit.Call(info.This(), {Napi::String::New(info.Env(), eventName)});
}
void NativeEmitter::EmitEvent(const Napi::CallbackInfo& info, std::string eventName, std::string eventData) {
    Napi::Function emit = info.This().As<Napi::Object>().Get("emit").As<Napi::Function>();
    emit.Call(info.This(), {Napi::String::New(info.Env(), eventName), Napi::String::New(info.Env(), eventData)});
}
void NativeEmitter::EmitEvent(const Napi::CallbackInfo& info, std::string eventName, int eventData) {
    Napi::Function emit = info.This().As<Napi::Object>().Get("emit").As<Napi::Function>();
    emit.Call(info.This(), {Napi::String::New(info.Env(), eventName), Napi::Number::New(info.Env(), eventData)});
}