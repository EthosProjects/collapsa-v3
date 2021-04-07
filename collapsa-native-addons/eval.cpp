#include <string>
#include <napi.h>
#include <iostream>
Napi::String Method(const Napi::CallbackInfo& info) {
    using namespace std;
    Napi::Env env = info.Env();
    string line;
    getline(std::cin, line);
    return Napi::String::New(env, line);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(
        Napi::String::New(env, "readConsole"),
        Napi::Function::New(env, Method)
    );
    return exports;
}

NODE_API_MODULE(hello, Init)