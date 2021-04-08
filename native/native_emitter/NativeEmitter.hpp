#include "../../node_modules/node-addon-api/napi.h"
#include <string>
class NativeEmitter : public Napi::ObjectWrap<NativeEmitter> {
    public:
        int id;
        static Napi::Object Export(Napi::Env env, Napi::Object exports);
        NativeEmitter(const Napi::CallbackInfo& info);
    private:
        static Napi::FunctionReference constructor;
        Napi::Value CallAndEmit(const Napi::CallbackInfo& info);
        void EmitEvent(const Napi::CallbackInfo& info, std::string eventName);
        void EmitEvent(const Napi::CallbackInfo& info, std::string eventName, int eventData);
        void EmitEvent(const Napi::CallbackInfo& info, std::string eventName, std::string eventData);
};