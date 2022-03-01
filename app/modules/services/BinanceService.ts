import * as ccxt from "ccxt";
import WebSocket from "ws";

export type TPrice = { [key: string]: number; };
export type TSockets = { [key: string]: any; };

class BinanceService {
    private prices: TPrice = {};
    private sockets: TSockets = {};

    constructor() {
        /**
         * Binance WebSock API states a socket will expires after 24 hours of inactivity.
         * We are being cautious and are regenerating socket connections after 23 hours
         */
        this.registerAllSockets();
        setInterval(async () => {
            await this.registerAllSockets();
        }, 23 * 60 * 60 * 1000);    
    }

    private registerAllSockets = async () => {
        const exchange = new ccxt.binance();
        const markets = await exchange.fetchMarkets();
        markets.forEach((market: any, i) => {
            // Only include usdt markets
            if (market.lowercaseId.indexOf('usdt') >= 0) {
                this.registerSocket(market.lowercaseId);
            }
        });
    }

    async getPrice(pair: String) {
        pair = pair.toLowerCase();
        let pairKey = pair as keyof typeof this.sockets;
        if(!this.sockets[pairKey]) {
            throw new Error(`Market (${pair}) not found on binance`);                
        }
        pairKey = pair as keyof typeof this.sockets;
        return this.prices[pairKey];
    }

    private registerSocket(pair: String) {
        let pairKey = pair as keyof typeof this.sockets;
        const socket = new WebSocket(`wss://stream.binance.com:9443/ws/${pair}@trade`);
        this.sockets[pairKey] = socket;
        return new Promise<any>((resolve, reject) => {
            socket.on('open', () => {
                // console.log('connected to websocket', socket);
                // socket.send(Date.now());
            });

            socket.on('message', (data) => {
                const response: any = JSON.parse(data);
                pairKey = pair as keyof typeof this.sockets;
                this.prices[pairKey] = response.p;
                // console.log('Data Received.--', response);
                resolve(response.p);
            });
    
            socket.on('close', () => {
                reject();
                console.log('Socket Closing..');
            });
    
            socket.on('error', (e) => {
                console.log('Socket error', e);
            });
        });
    }

}

/**
 * Exposing this service as Singleton
 */
var binanceService = new BinanceService();
export default binanceService;