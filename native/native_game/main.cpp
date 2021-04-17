#include "NativeGame.hpp"
using namespace Collapsa;
int main() {
	NativeGame* game = new NativeGame();
	for (int i = 0; i < 1; i++) {
		game->simJoin();
	}
	std::cout << "____________________________" << std::endl;
}