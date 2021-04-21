#pragma once
//#include "../native_emitter/NativeEmitter.hpp"
#include "entities/Player.hpp"
#include "quadtree/Quadtree.hpp"
#include "constants.hpp"
namespace Collapsa {
    class BinaryInterface {
    public:
        uint8_t* buffer;
        uint32_t byteLength;
        int index { 0 };
        BinaryInterface(uint8_t* t_buffer, uint32_t t_byteLength): buffer(t_buffer), byteLength(t_byteLength) {};
    };
    class OutputMessage: public BinaryInterface {
    public:
        std::string socketid;
        OutputMessage(uint8_t* t_buffer, uint32_t t_byteLength, std::string t_socketid): BinaryInterface(t_buffer, t_byteLength), socketid(t_socketid) {};
        ~OutputMessage(){
            std::cout << "Destructed output message but didn't free buffer";
        }
    };
    class InputMessage: public BinaryInterface {
    public:
        std::string socketid;
        InputMessage(uint8_t* t_buffer, uint32_t t_byteLength, std::string t_socketid): BinaryInterface(t_buffer, t_byteLength), socketid(t_socketid) {};
        ~InputMessage(){
            delete[] buffer;
            std::cout << "Destructed input message and freed buffer";
        }
    };
    class Reader: public BinaryInterface {
        Reader(uint8_t* t_buffer, uint32_t t_byteLength): BinaryInterface(t_buffer, t_byteLength) {};
        uint8_t readUint8(bool littleEndian = false) { ++index; return buffer[index-1]; };
    };
    class Writer: public BinaryInterface {
    public:
        Writer(uint8_t* t_buffer, uint32_t t_byteLength): BinaryInterface(t_buffer, t_byteLength) {};
        Writer& writeUint8(uint8_t uint8, bool littleEndian = false) { buffer[index] = uint8; ++index; return *this; };
        Writer& writeUint16(uint16_t uint16, bool littleEndian = false) {
            buffer[index] = (0xff & uint16) * littleEndian + ((0xff00 & uint16) >> 8) * !littleEndian;
            buffer[index+1] = ((0xff00 & uint16) >> 8) * littleEndian + (0xff & uint16) * !littleEndian;
            index += 2;
            return *this;
        };
        Writer& writeUint32(uint32_t uint32, bool littleEndian = false) {
            buffer[index] = (0xff & uint32) * littleEndian + ((0xff000000 & uint32) >> 32) * !littleEndian;
            if (littleEndian) {
                buffer[index+1] = (0xff00 & uint32) >> 8;
                buffer[index+2] = (0xff0000 & uint32) >> 16;
                buffer[index+3] = (0xff000000 & uint32) >> 32;
            }else {
                buffer[index+1] = ((0xff0000 & uint32) >> 16);
                buffer[index+2] = ((0xff00 & uint32) >> 8);
                buffer[index+3] = 0xff & uint32;
            }
            index += 4;
            return *this;
        };
    };
    class Game {
    protected:
        std::atomic<bool> m_running;
        std::vector<InputMessage*> m_p_inputMessages;
        std::vector<OutputMessage*> m_p_outputMessages;
        std::mutex m_p_inputMessages_mutex;
        std::mutex m_p_outputMessages_mutex;
        std::map<std::string, Player*> m_p_socketPlayerMap;
        std::thread m_loopThread;
        Player* m_Players[constants::PLAYER::LIMIT] { nullptr };
        Entity* m_entities[constants::PLAYER::LIMIT] { nullptr };
        quadtree::Quadtree m_quadtree;
    public:
        int playerCount;
        Game(); 
        ~Game(){
            std::cout << "Game destroyed" << std::endl;
        }
        void readMessages();
        void update();
        void startLoop();
        void stopLoop();
        void loop();
    };

};