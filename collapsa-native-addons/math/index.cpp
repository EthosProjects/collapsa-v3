#include <napi.h>
#include <math.h>
#define PI 3.14

using namespace std;
static Napi::Value _cos(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    return Napi::Number::New(env, cos(info[0].As<Napi::Number>().DoubleValue() * PI / 180.0 ));
}
static Napi::Value _sin(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    return Napi::Number::New(env, sin(info[0].As<Napi::Number>().DoubleValue() * PI / 180.0 ));
}
static Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(
        Napi::String::New(env, "cos"),
        Napi::Function::New(env, _cos)
    );
    exports.Set(
        Napi::String::New(env, "sin"),
        Napi::Function::New(env, _sin)
    );
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)