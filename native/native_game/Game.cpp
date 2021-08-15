#include "Game.hpp"
namespace Collapsa {
    void Game::_outputMessage(OutputMessage* t_p_outputMessage) {
        m_p_outputMessages_mutex.lock();
        m_p_outputMessages.push_back(t_p_outputMessage);
        m_p_outputMessages_mutex.unlock();
    };
    void Game::_inputMessage(InputMessage* t_p_inputMessage) {
        m_p_inputMessages_mutex.lock();
        m_p_inputMessages.push_back(t_p_inputMessage);
        m_p_inputMessages_mutex.unlock();
    };
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
                    _outputMessage(new OutputMessage { 
                        new uint8_t[1]{ constants::MSG_TYPES::GAME_LOADING }, 
                        1,
                        pMessage->socketid
                    });
                    uint8_t playerIndex = 0,
                        entityIndex = 0;
                    while(playerIndex < constants::PLAYER::LIMIT){ if(m_Players[playerIndex] == nullptr) break; ++playerIndex; };
                    while(entityIndex < constants::PLAYER::LIMIT){ if(m_entities[entityIndex] == nullptr) break; ++entityIndex; };
                    _outputMessage(new OutputMessage { 
                        new uint8_t[2]{ constants::MSG_TYPES::PLAYER_ID, playerIndex }, 
                        2,
                        pMessage->socketid
                    });
                    Player* newPlayer = new Player(this, pMessage->socketid, messageReader.readString(16), playerIndex, entityIndex);
                    m_Players[playerIndex] = newPlayer;
                    m_entities[entityIndex] = newPlayer;
                    m_p_socketPlayerMap[pMessage->socketid] = newPlayer;
                    playerCount++;
                    m_quadtree.insert(newPlayer);

                    PositionOld::Overwrite playerPos = newPlayer->body->getPosition();
                    std::set<int> entityIds = m_quadtree.query(playerPos.x - 160, playerPos.y - 90, playerPos.x + 160, playerPos.y + 90);
                    std::set<int> playerIds;
                    for (int i: entityIds) {
                        if(m_entities[i]->is == constants::PLAYER::TYPE) playerIds.insert(i);
                    };
                    newPlayer->viewport.playerIDs = playerIds;
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
                        PositionOld::Overwrite playerPosition = m_Players[playerId]->body->getPosition();
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
                case constants::MSG_TYPES::INPUT: {
                    Player* player = m_p_socketPlayerMap[pMessage->socketid];
                    if(!player) break;
                    player->movement[0] = pMessage->buffer[1];
                    player->movement[1] = pMessage->buffer[2];
                    player->movement[2] = pMessage->buffer[3];
                    player->movement[3] = pMessage->buffer[4];
                    player->movement[4] = pMessage->buffer[5];
                } 
                default: {
                    std::cout << "Unknown Message " << (int) pMessage->buffer[0] << std::endl;
                }
            }
            delete pMessage;
        }
        m_p_inputMessages.clear();
        m_p_inputMessages_mutex.unlock();
    };
    void Game::loop(){
        auto lastFrame = std::chrono::high_resolution_clock::now();
        while(m_running){
            auto currentFrame = std::chrono::high_resolution_clock::now();
            auto elapsed = std::chrono::duration_cast<std::chrono::microseconds>(currentFrame - lastFrame).count();
            if (elapsed < 100000) continue;
            readMessages();
            update(elapsed);
            //std::cout << elapsed << " microseconds were updated\n";
            //std::cout << "The update took " << std::chrono::duration_cast<std::chrono::microseconds>(std::chrono::high_resolution_clock::now() - currentFrame).count() << " microseconds\n";
            lastFrame = currentFrame;
        }
        std::cout << "Terminated Game loop" << std::endl;
        return;
    };
    void Game::startLoop(){ m_running = true; m_loopThread = std::thread(&Game::loop, this); };
    void Game::stopLoop(){ m_running = false; m_loopThread.join();};
    void Game::update(long long t_delta){
        for (int i = 0;i <constants::PLAYER::LIMIT;i++){
            Player* player = m_Players[i];
            if (player == nullptr) continue;
            player->update(t_delta);
        }
        for (int i = 0;i < constants::PLAYER::LIMIT;i++){
            Player* player = m_Players[i];
            if (player == nullptr) continue;
            if (!player->body->hasMoved) continue;
            m_quadtree.clear();
            for(int i = 0;i < constants::PLAYER::LIMIT;i++){
                player = m_Players[i];
                if (player == nullptr) continue;
                m_quadtree.insert(player);
            }
            break;
        }
    };
    Game::Game(): 
        m_quadtree(0, 0, 256, 256),
        playerCount(0)
    {
        for(size_t i = 0; i < 255; i++) m_Players[i] = nullptr;
        startLoop();
    };
}
