import EventEmitter from 'eventemitter3';

export default class PortChild extends EventEmitter {
    constructor(channelKey = false) {
        super();

        if(!channelKey)
            throw 'No communication channel provided';


        this._channelKey = channelKey;
        this._connected = false;

        this._connect();
    }

    _connect() {
        this._port = chrome.runtime.connect({ name: this._channelKey });
        this._connected = true;

        this._port.onMessage.addListener(({ action, data }) => {
            this.emit(action, data);
        });

        this._port.onDisconnect.addListener(port => {
            console.log(`Lost connection to backgroundScript: ${chrome.runtime.lastError}`);
            this._connected = false;
        });
    }

    send(action = false, data = {}) {
        if(!action)
            return { success: false, error: 'Function requires action {string} parameter' };

        if(!this._connected)
            return { success: false, error: 'Connection to backgroundScript failed' };

        this._port.postMessage({ action, data });
        return { success: true };
    }
}