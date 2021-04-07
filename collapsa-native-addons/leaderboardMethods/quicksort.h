#include "leaderboard.h"
void swap(leaderboardSlot * a, leaderboardSlot * b) {  
    leaderboardSlot t = *a;  
    *a = *b;  
    *b = t;  
}
int partition (leaderboardSlot * leaderboard, int low, int high) {  
    uint32_t pivot = leaderboard[high].score; 
    int i = low - 1;
    for (int j = low; j <= high - 1; j++) {  
        if (leaderboard[j].score < pivot) {  
            i++;
            swap(leaderboard + i, leaderboard + j);  
        }  
    }  
    swap(leaderboard + i + 1, leaderboard + high);  
    return (i + 1);  
}
void quicksort (leaderboardSlot * leaderboard, int low, int high) {  
    if (low < high) {  
        int pi = partition(leaderboard, low, high);  
        quicksort(leaderboard, low, pi - 1);  
        quicksort(leaderboard, pi + 1, high);  
    }  
}
