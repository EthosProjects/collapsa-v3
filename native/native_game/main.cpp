#include "NativeGame.hpp"
using namespace Collapsa;
void testQuadTree() {
	
	quadtree::Quadtree qtree{ 0, 0, 16384, 16384 };
	constexpr int playerCount = 655,
		testCount = 1000;
	constexpr int iterationCount = playerCount * testCount;
	Player* players[playerCount];
	for (int i = 0; i < playerCount; i++) {
		players[i] = new Player(nullptr, std::string{ "" }, std::string{ "" }, i, i);
	}
	long long a = 0;
	for (int i = 0; i < testCount; i++) {
		auto start = std::chrono::high_resolution_clock::now();
		for (int i = 0; i < playerCount; i++) {
			qtree.insert(players[i]);
		}
		auto elapsed = std::chrono::high_resolution_clock::now() - start;
		long long microseconds = std::chrono::duration_cast<std::chrono::microseconds>(elapsed).count();
		//std::cout << microseconds << std::endl;
		a += microseconds;
		qtree.clear();
		std::cout << "\r" << (long double)a / ((long double)(playerCount * (i + 1))) << " is the current average.\n";
	}
	long double average = a / (long double)iterationCount;
	std::cout << average << "\n";
}
int main() {
	NativeGame* game = new NativeGame();
	using namespace std::chrono_literals;
	//std::this_thread::sleep_for(2000ms);
	game->pushInputMessage(new InputMessage(new uint8_t[1]{constants::MSG_TYPES::JOIN_GAME}, 1, "a"));
	std::this_thread::sleep_for(2000ms);
	game->pushInputMessage(new InputMessage(new uint8_t[1]{constants::MSG_TYPES::JOIN_GAME}, 1, "b"));
	std::this_thread::sleep_for(2000ms);
	game->pushInputMessage(new InputMessage(new uint8_t[9]{ 9, 0, 0, 107, 122, 1, 88, 1, 82 }, 9, "b"));
	std::this_thread::sleep_for(2000ms);
	game->pushInputMessage(new InputMessage(new uint8_t[9]{ 9, 0, 1, 107, 122, 1, 88, 1, 82 }, 9, "b"));
	//testQuadTree();
	std::this_thread::sleep_for(std::chrono::seconds(30));
};