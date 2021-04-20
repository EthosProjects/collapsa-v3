#include "Game.hpp"
namespace Collapsa {
    void Game::readMessages(){
        m_p_inputMessages_mutex.lock();
        for(std::vector<InputMessage*>::iterator ppMessage = m_p_inputMessages.begin(); ppMessage < m_p_inputMessages.end(); ppMessage++){
            InputMessage* pMessage = *ppMessage;
            switch(pMessage->data[0]) {
                case constants::MSG_TYPES::JOIN_GAME: {
                    if(playerCount == constants::PLAYER::LIMIT){
                        //Create a "Game full message"
                        break;
                    }
                    int playerIndex = 0,
                        entityIndex = 0;
                    while(playerIndex < constants::PLAYER::LIMIT){ if(m_Players[playerIndex] == nullptr) break; ++playerIndex; };
                    while(entityIndex < constants::PLAYER::LIMIT){ if(m_entities[entityIndex] == nullptr) break; ++entityIndex; };
                    Player * newPlayer = new Player(this, pMessage->socketid, playerIndex, entityIndex);
                    m_Players[playerIndex] = newPlayer;
                    m_entities[entityIndex] = newPlayer;
                    this->m_p_socketPlayerMap[pMessage->socketid] = newPlayer;
                    playerCount++;
                    m_quadtree.insert(newPlayer);

                    Position::Overwrite playerPos = newPlayer->body->getPosition();
                    std::set<int> entityIds = m_quadtree.query(playerPos.x - 256, playerPos.y - 256, playerPos.x + 256, playerPos.y + 256);
                    std::set<int> playerIds;
                    std::cout << "Making player\n";
                    for (int i: entityIds) {
                        if(m_entities[i]->is == constants::PLAYER::TYPE) playerIds.insert(i);
                    };
                    newPlayer->viewport.players = playerIds;
                    // 00000000 0000000000000000 0000000000000000 00000000 0000000 
                    // PlayerID XPosition        YPosition        XVel     YVel
                    constexpr uint16_t playersize = 1 + 4 + 2;
                    uint16_t outputSize = 2 + playerIds.size() * playersize;
                    OutputMessage *newPlayerMessage = new OutputMessage { 
                        new uint8_t[outputSize]{ 0 }, 
                        pMessage->socketid,
                        outputSize
                    };
                    newPlayerMessage->data[0] = constants::MSG_TYPES::ADD_ENTITY;
                    newPlayerMessage->data[1] = playerIds.size();
                    int msgIndex = 2;
                    for(int playerId : playerIds) {
                        newPlayerMessage->data[msgIndex] = m_Players[playerId]->id;
                        Position::Overwrite playerPosition = m_Players[playerId]->body->getPosition();
                        
                        msgIndex += playersize;
                    }
                    m_p_outputMessages_mutex.lock();
                    m_p_outputMessages.push_back(newPlayerMessage);
                    m_p_outputMessages_mutex.unlock();
                    break;
                }
                default: {
                    std::cout << "Unknown Message " << pMessage->data[0] << std::endl;
                }
            }
            std::cout << "Processed message" << std::endl;
            delete pMessage;
        }
        m_p_inputMessages.clear();
        m_p_inputMessages_mutex.unlock();
    };
    void Game::loop(){
        while(m_running){
            readMessages();
            update();
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
