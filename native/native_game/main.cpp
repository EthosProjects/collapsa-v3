#include "NativeGame.hpp"
using namespace Collapsa;
int main() {
	NativeGame* game = new NativeGame();
	for (int i = 0; i < 30; i++) {
		std::cout << "____________________________" << std::endl;
		game->simJoin();
	}
	std::cout << "____________________________" << std::endl;
}