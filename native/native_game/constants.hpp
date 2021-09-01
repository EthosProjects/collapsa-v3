namespace constants {
    namespace MSG_TYPES {
        constexpr uint8_t JOIN_GAME = 0;
        constexpr uint8_t GAME_FULL = 1;
        constexpr uint8_t GAME_LOADING = 2;
        constexpr uint8_t GAME_STATE = 3;
        constexpr uint8_t GAME_UPDATE = 4;
        constexpr uint8_t GAME_OVER = 5;
        constexpr uint8_t ADD_ENTITY = 6;
        constexpr uint8_t REMOVE_ENTITY = 7;
        constexpr uint8_t SOCKET_ID = 8;
        constexpr uint8_t INPUT = 9;
        constexpr uint8_t SELF_UPDATE = 10;
        constexpr uint8_t CRAFT_ITEM = 11;
        constexpr uint8_t EQUIP_ITEM = 12;
        constexpr uint8_t DROP_ITEM = 13;
        constexpr uint8_t PICKUP_ITEM = 14;
        constexpr uint8_t LEADERBOARD = 15;
        constexpr uint8_t DROPPED_ITEMS_ADD = 16;
        constexpr uint8_t DROPPED_ITEMS_REMOVE = 17;
        constexpr uint8_t ACTION_KEY = 18;
        constexpr uint8_t PLAYER_ID = 19;
        constexpr uint8_t PLAYER_VISUAL = 20;
    };
    namespace PLAYER {
        constexpr int TYPE = 1;
        constexpr int LIMIT = 255;
    };
};