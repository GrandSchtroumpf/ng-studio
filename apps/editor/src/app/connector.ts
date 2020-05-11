import { ClientConnector, connectClient, applyApi, Client, PluginClient, Message, Api, ApiMap } from '@remixproject/plugin'

declare const acquireVsCodeApi: any;

/**
 * This Webview connector
 */
export class WebviewConnector implements ClientConnector {
  postMessage: (message: any) => void;
  constructor() {
    this.postMessage = acquireVsCodeApi().postMessage;
  }

  /** Send a message to the engine */
  send(message: Partial<Message>) {
    console.log('Send', message.action, message.key)
    this.postMessage(message);
  }

  /** Get messae from the engine */
  on(cb: (message: Partial<Message>) => void) {
    if (!window) {
      return;
    }
    window.addEventListener('message', (event: MessageEvent) => {
      if (!event.source) throw new Error('No source')
      if (!event.data) throw new Error('No data')
      console.log('Get message', event.data.name, event.data.action, event.data.key)
      cb(event.data)
    }, false)
  }
}

/**
 * Connect a Webview plugin client to a web engine
 * @param client An optional websocket plugin client to connect to the engine.
 */
export const createWebviewClient = <
  P extends Api,
  App extends ApiMap
>(client: PluginClient<P, App> = new PluginClient()): Client<P, App> => {
  connectClient(new WebviewConnector(), client);
  applyApi(client);
  return client as any;
}
