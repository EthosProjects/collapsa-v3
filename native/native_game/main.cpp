#include "NativeGame.hpp"
using namespace Collapsa;
int main() {
	NativeGame* game = new NativeGame();
	for (int i = 0; i < 64; i++) {
		game->simJoin();
	}
	std::this_thread::sleep_for(std::chrono::seconds(30));
}