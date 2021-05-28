var url = new URL(window.location.href);
var errorMessage = document.createElement('p');
errorMessage.id = 'error-message';
errorMessage.innerHTML = `You tried to find <code>${url.pathname}</code>. This page was not found on the server.`;
document.body.appendChild(errorMessage);
