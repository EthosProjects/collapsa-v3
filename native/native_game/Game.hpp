//#include "../native_emitter/NativeEmitter.hpp"
#include "entities/Player.hpp"
#include "quadtree/Quadtree.hpp"
#include "constants.hpp"
#define LITTLE_ENDIAN false;
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
            delete[] buffer;
            //std::cout << "Destructed output message and freed buffer\n";
        }
    };
    class InputMessage: public BinaryInterface {
    public:
        std::string socketid;
        InputMessage(uint8_t* t_buffer, uint32_t t_byteLength, std::string t_socketid): BinaryInterface(t_buffer, t_byteLength), socketid(t_socketid) {};
        ~InputMessage(){
            delete[] buffer;
            //std::cout << "Destructed input message and freed buffer\n";
        }
    };
    class Reader: public BinaryInterface {
    public:
        Reader(uint8_t* t_buffer, uint32_t t_byteLength): BinaryInterface(t_buffer, t_byteLength) {};
        Reader(InputMessage& t_inputMessage): BinaryInterface(t_inputMessage.buffer, t_inputMessage.byteLength) {};
        std::string readString(int len) {
            int trueLength = len;
            for(int i = 0; i < len; ++i) if(buffer[index+i] == 0) --trueLength;
            char* str = new char[trueLength+1] { 0 };
            for(int i = 0, j = 0; i < len; ++i){ if (buffer[index+i] != 0){ str[j] = buffer[index+i]; ++j; }; };
            index+=len;
            std::string out { str };
            delete[] str;
            return out;
        };
        uint8_t readUint8(bool littleEndian = false) { ++index; return buffer[index-1]; };
    };
    class Writer: public BinaryInterface {
    public:
        Writer(uint8_t* t_buffer, uint32_t t_byteLength): BinaryInterface(t_buffer, t_byteLength) {};
        Writer& writeString(std::string str, unsigned int length){
            for(unsigned int i = 0; i < str.length() && i < length; ++i) buffer[index+i] = (uint8_t) str[i];
            index+=length;
            return *this;
        };
        Writer& writeUint8(uint8_t uint8, bool littleEndian = false) { buffer[index] = uint8; ++index; return *this; };
        Writer& writeUint16(uint16_t uint16, bool littleEndian = false) {
            buffer[index] = (0xff & uint16) * littleEndian + ((0xff00 & uint16) >> 8) * !littleEndian;
            buffer[index+1] = ((0xff00 & uint16) >> 8) * littleEndian + (0xff & uint16) * !littleEndian;
            index += 2;
            return *this;
        };
        Writer& writeUint32(uint32_t uint32, bool littleEndian = false) {
            buffer[index] = (0xff & uint32) * littleEndian + ((0xff000000 & uint32) >> 24) * !littleEndian;
            buffer[index+1] = ((0xff00 & uint32) >> 8) * littleEndian + ((0xff0000 & uint32) >> 16) * !littleEndian;
            buffer[index+2] = ((0xff0000 & uint32) >> 16) * littleEndian + ((0xff00 & uint32) >> 8) * !littleEndian;
            buffer[index+3] = ((0xff000000 & uint32) >> 32) * littleEndian + (0xff & uint32) * !littleEndian;
            index += 4;
            return *this;
        };
    };
    class Game {
    protected:
    public:
        void pushOutputMessage(OutputMessage* t_p_outputMessage);
        void pushInputMessage(InputMessage* t_p_inputMessage);
        std::atomic<bool> m_running;
        std::vector<InputMessage*> m_p_inputMessages;
        std::vector<OutputMessage*> m_p_outputMessages;
        std::mutex m_p_inputMessages_mutex;
        std::mutex m_p_outputMessages_mutex;
        std::map<std::string, Player*> m_p_socketPlayerMap;
        std::thread m_loopThread;
        Player* array_p_players[constants::PLAYER::LIMIT] { nullptr };
        Entity* array_p_entities[constants::PLAYER::LIMIT] { nullptr };
        friend void Player::updateViewport();
        int playerCount;
        quadtree::Quadtree qtree;
        Game(); 
        ~Game(){
            std::cout << "Game destroyed" << std::endl;
        }
        void readMessages();
        void update(long long t_delta);
        void startLoop();
        void stopLoop();
        void loop();
    };

};