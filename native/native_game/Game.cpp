#include "Game.hpp"
namespace Collapsa {
    void Game::pushOutputMessage(OutputMessage* t_p_outputMessage) {
        m_p_outputMessages_mutex.lock();
        m_p_outputMessages.push_back(t_p_outputMessage);
        m_p_outputMessages_mutex.unlock();
    };
    void Game::pushInputMessage(InputMessage* t_p_inputMessage) {
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
                    pushOutputMessage(new OutputMessage { 
                        new uint8_t[1]{ constants::MSG_TYPES::GAME_LOADING }, 
                        1,
                        pMessage->socketid
                    });
                    uint8_t playerIndex = 0,
                        entityIndex = 0;
                    while(playerIndex < constants::PLAYER::LIMIT){ if(array_p_players[playerIndex] == nullptr) break; ++playerIndex; };
                    while(entityIndex < constants::PLAYER::LIMIT){ if(array_p_entities[entityIndex] == nullptr) break; ++entityIndex; };
                    pushOutputMessage(new OutputMessage { 
                        new uint8_t[2]{ constants::MSG_TYPES::PLAYER_ID, playerIndex }, 
                        2,
                        pMessage->socketid
                    });
                    Player* newPlayer = new Player(this, pMessage->socketid, messageReader.readString(16), playerIndex, entityIndex);
                    array_p_players[playerIndex] = newPlayer;
                    array_p_entities[entityIndex] = newPlayer;
                    m_p_socketPlayerMap[pMessage->socketid] = newPlayer;
                    playerCount++;
                    qtree.insert(newPlayer);
                    newPlayer->updateViewport();
                    break;
                }
                case constants::MSG_TYPES::INPUT: {
                    Player* player = m_p_socketPlayerMap[pMessage->socketid];
                    if(!player) break;
                    if (player->movement[2] != pMessage->buffer[2]) player->animated = true;
                    if (player->movement[1] != pMessage->buffer[1]) player->animated = true;
                    player->movement[0] = pMessage->buffer[1];
                    player->movement[1] = pMessage->buffer[2];
                    player->movement[2] = pMessage->buffer[3];
                    player->movement[3] = pMessage->buffer[4];
                    player->movement[4] = pMessage->buffer[5];
                    player->p_body->hasMoved = true;
                    break;
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
            if (elapsed < 16'000) continue;
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
            Player* player = array_p_players[i];
            if (player == nullptr) continue;
            player->update(t_delta);
        }
        bool hasMovement = false;
        int canSee[constants::PLAYER::LIMIT] { 0 };
        for (int i = 0;i < constants::PLAYER::LIMIT;i++){
            Player* player = array_p_players[i];
            if (player == nullptr) continue;
            if (player->p_body->hasMoved) { 
                hasMovement = true;
                break;
            }
        }
        if (hasMovement) {
            qtree.clear();
            for(int i = 0;i < constants::PLAYER::LIMIT;i++){
                Player* player = array_p_players[i];
                if (player == nullptr) continue;
                qtree.insert(player);
            }
            for(int i = 0;i < constants::PLAYER::LIMIT;i++){
                Player* player = array_p_players[i];
                if (player == nullptr) continue;
                player->updateViewport();
                player->p_body->hasMoved = false;
            }
        };
        for(int i = 0;i < constants::PLAYER::LIMIT;i++){
            Player* player = array_p_players[i];
            if (player == nullptr) continue;
            player->animateViewport();
        };
        for(int i = 0;i < constants::PLAYER::LIMIT;i++){
            Player* player = array_p_players[i];
            if (player == nullptr) continue;
            player->animated = false;
        }
    };
    Game::Game(): qtree(0, 0, 2047, 2047), playerCount(0) { startLoop(); };
}
