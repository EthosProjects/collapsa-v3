var url = new URL(window.location.href);
var errorMessage = document.createElement('p');
errorMessage.id = 'error-message';
var timer = 10;
setInterval(() => {
    timer--;
    errorMessage.innerHTML = `You tried to find <code>${url.pathname}</code>. This page was not found on the server. Redirecting in ${timer} seconds`;
    if (timer <= 0) history.back();
}, 1000);
errorMessage.innerHTML = `You tried to find <code>${url.pathname}</code>. This page was not found on the server. Redirecting in 10 seconds`;
document.body.appendChild(errorMessage);
