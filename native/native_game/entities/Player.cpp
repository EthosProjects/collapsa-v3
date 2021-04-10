#include "Player.hpp"
#include "../Game.hpp"
Napi::FunctionReference * Player::pConstructor = new Napi::FunctionReference();
void Player::Export(Napi::Env env, Napi::Object exports) {
    Napi::Object playerExport = Napi::Object::New(env);
    playerExport.Set("bindClassToNative", Napi::Function::New(env, Player::BindClassToNative));
    playerExport.Set("bindInstanceToNative", Napi::Function::New(env, Player::BindInstanceToNative));
    exports.Set("NativePlayer", playerExport);
}
Player::Player(Game * gamePointer): Entity(Position(30, 40), HealthOptions(30, 40), gamePointer) {};
Napi::Value Player::BindClassToNative(const Napi::CallbackInfo & info){
    Napi::Env env = info.Env();
    info[0].As<Napi::Object>().Get("prototype").As<Napi::Object>().Set("NativeBound", Napi::Boolean::New(env, 0));
    *Player::pConstructor = Napi::Persistent(info[0].As<Napi::Function>());
    return env.Undefined();
};
Napi::Value Player::BindInstanceToNative(const Napi::CallbackInfo & info){
    Napi::Env env = info.Env();
    Napi::Object playerObj = info[0].As<Napi::Object>();
    bool * lossless;
    Game * game = (Game *) playerObj.Get("game").As<Napi::Object>().Get("address").As<Napi::BigInt>().Int64Value(lossless);
    if(lossless == false) std::cout << "Failed to get address" << std::endl;
    Player * player = new Player(game);
    playerObj.Set("address", Napi::BigInt::New(env, (int64_t) player));
    return env.Undefined();
}