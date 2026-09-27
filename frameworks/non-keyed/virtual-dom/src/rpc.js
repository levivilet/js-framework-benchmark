export const createRpc = (target, methods = {}) => {
  target.addEventListener("message", (event) => {
    const message = event.data
    if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
      return
    }
    const handler = methods[message.method]
    if (handler) {
      handler(message.params)
    }
  })

  return {
    notify(method, params) {
      target.postMessage({
        jsonrpc: "2.0",
        method,
        params,
      })
    },
  }
}
