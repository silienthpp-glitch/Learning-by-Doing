/* Desktop-Brücke – die Webversion nutzt weiterhin den vorhandenen Python-Server.
   In Tauri wird nur die erlaubte native KI-Funktion aufgerufen.
   API-Keys erscheinen niemals in diesem JavaScript-Code. */
(function () {
  if (!window.__TAURI__?.core?.invoke) return;
  window.learningDesktopAI = async (endpoint, payload, signal) => {
    if (signal?.aborted) throw new DOMException('Abgebrochen', 'AbortError');
    const invoke = window.__TAURI__.core.invoke('ai_request', {
      endpoint,
      payload: payload === undefined ? null : payload
    });
    if (!signal) return invoke;
    return new Promise((resolve, reject) => {
      const stop = () => reject(new DOMException('Abgebrochen', 'AbortError'));
      signal.addEventListener('abort', stop, { once: true });
      invoke.then(resolve, reject).finally(() => signal.removeEventListener('abort', stop));
    });
  };
})();
