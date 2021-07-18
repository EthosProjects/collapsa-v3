#ifndef UNICODE
#define UNICODE
#endif 

#include <windows.h>
int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, PWSTR pCmdLine, int nCmdShow) {
	HKEY hEnvironmentKey;
	LSTATUS lStatus = RegOpenKeyEx(
		HKEY_LOCAL_MACHINE,
		L"SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment",
		0,
		KEY_READ | KEY_WRITE,
		&hEnvironmentKey
	);
	if (lStatus != ERROR_SUCCESS) return 1;
	LPCWSTR keys [4] = {
		L"COLLAPSABOT_TOKEN",
		L"COLLAPSABEATS_TOKEN",
		L"MONGODB_USERNAME",
		L"MONGODB_PASSWORD"
	};
	LPCWSTR values [4] = {
		L"ODI4NzQ2NDgxODIwNzYyMTIz.YGuETg.wynepf1ldMo5R0KeP536yut_9Cw",
		L"ODI4NzQ0NzgyNTk5MTU5OTAw.YGuCuQ.Xl8fLVNP0j4u9n6zU3A1ufGFMzY",
		L"LogosKing",
		L"TBKCKD6B"
	};
	for (size_t i = 0; i < 4; i++) {
		RegSetValueEx(hEnvironmentKey, keys[i], 0, REG_SZ, (LPBYTE)values[i], sizeof(wchar_t) * (wcslen(values[0]) + 1));
	}
	RegCloseKey(hEnvironmentKey);
	BroadcastSystemMessage(0, 0, WM_SETTINGCHANGE, 0, (LPARAM)TEXT("Environment"));
	return 0;
} 