#include "Game.hpp"
namespace Collapsa {
    void Game::readMessages(){
        m_p_inputMessages_mutex.lock();
        for(std::vector<InputMessage*>::iterator ppMessage = m_p_inputMessages.begin(); ppMessage < m_p_inputMessages.end(); ppMessage++){
            InputMessage* pMessage = *ppMessage;
            Reader messageReader { *pMessage };
            uint8_t messageType = messageReader.readUint8();
            switch(messageType) {
                case constants::MSG_TYPES::JOIN_GAME: {
                    if(playerCount == constants::PLAYER::LIMIT){
                        //Create a "Game full message"
                        break;
                    }
                    OutputMessage *loadingMessage = new OutputMessage { 
                        new uint8_t[1]{ constants::MSG_TYPES::GAME_LOADING }, 
                        1,
                        pMessage->socketid
                    };
                    
                    m_p_outputMessages_mutex.lock();
                    m_p_outputMessages.push_back(loadingMessage);
                    m_p_outputMessages_mutex.unlock();
                    uint8_t playerIndex = 0,
                        entityIndex = 0;
                    while(playerIndex < constants::PLAYER::LIMIT){ if(m_Players[playerIndex] == nullptr) break; ++playerIndex; };
                    while(entityIndex < constants::PLAYER::LIMIT){ if(m_entities[entityIndex] == nullptr) break; ++entityIndex; };
                    OutputMessage *playerIDMessage = new OutputMessage { 
                        new uint8_t[2]{ constants::MSG_TYPES::PLAYER_ID, playerIndex }, 
                        2,
                        pMessage->socketid
                    };

                    m_p_outputMessages_mutex.lock();
                    m_p_outputMessages.push_back(playerIDMessage);
                    m_p_outputMessages_mutex.unlock();

                    Player* newPlayer = new Player(this, pMessage->socketid, messageReader.readString(16), playerIndex, entityIndex);
                    m_Players[playerIndex] = newPlayer;
                    m_entities[entityIndex] = newPlayer;
                    this->m_p_socketPlayerMap[pMessage->socketid] = newPlayer;
                    playerCount++;
                    m_quadtree.insert(newPlayer);

                    Position::Overwrite playerPos = newPlayer->body->getPosition();
                    std::set<int> entityIds = m_quadtree.query(playerPos.x - 256, playerPos.y - 256, playerPos.x + 256, playerPos.y + 256);
                    std::set<int> playerIds;
                    for (int i: entityIds) {
                        if(m_entities[i]->is == constants::PLAYER::TYPE) playerIds.insert(i);
                    };
                    newPlayer->viewport.players = playerIds;
                    // 00000000 0000000000000000 0000000000000000 00000000 0000000 
                    // PlayerID XPosition        YPosition        XVel     YVel
                    constexpr uint16_t playersize = 1 + 4 + 2 + 16;
                    uint32_t outputSize = 2 + playerIds.size() * playersize;
                    OutputMessage *newPlayerMessage = new OutputMessage { 
                        new uint8_t[outputSize]{ 0 }, 
                        outputSize,
                        pMessage->socketid
                    };
                    Writer w { newPlayerMessage->buffer, newPlayerMessage->byteLength };
                    w.writeUint8(constants::MSG_TYPES::ADD_ENTITY).writeUint8(playerIds.size());
                    for(int playerId : playerIds) {
                        Position::Overwrite playerPosition = m_Players[playerId]->body->getPosition();
                        w.writeUint8(m_Players[playerId]->id)
                            .writeUint16(playerPosition.x, false)
                            .writeUint16(playerPosition.y, false)
                            .writeUint16(0, false)
                            .writeString(m_Players[playerId]->username, 16);
                    }
                    m_p_outputMessages_mutex.lock();
                    m_p_outputMessages.push_back(newPlayerMessage);
                    m_p_outputMessages_mutex.unlock();
                    break;
                }
                default: {
                    std::cout << "Unknown Message " << pMessage->buffer[0] << std::endl;
                }
            }
            delete pMessage;
        }
        m_p_inputMessages.clear();
        m_p_inputMessages_mutex.unlock();
    };
    void Game::loop(){
        while(m_running){
            //auto start = std::chrono::high_resolution_clock::now();
            readMessages();
            update();
            //auto elapsed = std::chrono::high_resolution_clock::now() - start;
            //long long microseconds = std::chrono::duration_cast<std::chrono::microseconds>(elapsed).count();
            //std::cout << microseconds << std::endl;
        }
        std::cout << "Terminated Game loop" << std::endl;
        return;
    };
    void Game::startLoop(){ m_running = true; m_loopThread = std::thread(&Game::loop, this); };
    void Game::stopLoop(){ m_running = false; m_loopThread.join();};
    void Game::update(){};
    Game::Game(): 
        m_quadtree(0, 0, 256, 256),
        playerCount(0)
    {
        for(size_t i = 0; i < 255; i++) m_Players[i] = nullptr;
        startLoop();
    };
}
