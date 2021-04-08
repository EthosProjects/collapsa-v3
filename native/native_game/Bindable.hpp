#include "../native_emitter/NativeEmitter.hpp"
#include <iostream>
template <class BOUND>
class Bindable {
public:
    Bindable(){}; 
    ~Bindable(){};
    virtual static Napi::Value BindToClass(const Napi::CallbackInfo& info) = 0;
    virtual static Napi::Value BindInstanceToNative(const Napi::CallbackInfo& info) = 0;
};
template <class BOUND>
Napi::Value Bindable<BOUND>::BindToClass(const Napi::CallbackInfo & info){
    Napi::Env env = info.Env();
    if(info.Length() != 1) std::cout << "Invalid argument list" << std::endl;
    Napi::Object constructorObj = info[0].As<Napi::Object>();
    constructorObj.Get("prototype").As<Napi::Object>().Set("red", Napi::String::New(env, "blue"));
    return env.Undefined();
};
template <class BOUND>
Napi::Value Bindable<BOUND>::BindInstanceToNative(const Napi::CallbackInfo & info){
    Napi::Env env = info.Env();
    if(info.Length() != 1) std::cout << "Invalid argument count" << std::endl;
    Napi::Object gameObj = info[0].As<Napi::Object>();
    BOUND * game = new BOUND();
    gameObj.Set("address", Napi::String::New(env, std::to_string((long) game)));
    return env.Undefined();
};