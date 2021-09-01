import { Socket } from 'socket.io';
import { config } from '../../config/config';
import { parseQueryUrl } from '../util/parse-query-url';

/**
 * This function initiates the socket-client handling
 * 
 * > You can add as many events as you want but remember to
 * keep the single responsibility pattern before writting
 * so much code inside a single function that you can't
 * handle after three days.
 * 
 * @param {Socket} client socket io client
 */
export function socketInit(client: Socket): void {
    client.on('authorize', (jwt: string) => {
        handle(client, jwt);
    });
}

/**
 * Watches and handles the client to rooms and process messages.
 * 
 * @param client SocketIO client
 * @param data anything to compute
 */
async function handle(client: Socket, jwt: string): Promise<void> {
    if (jwt) {
        // Emits an authorization event to the client 
        emit('authorized', { status: true }, null, client);
        // Makes the first sync in order to display initial data
        /**
            const ctl = new MyController();
            const data = await ctl.get(); 
            firstSync(client, data);
        */
        // Watches the custom filters event and process filters
        client.on('my-event', (data) => {
            // code
        })
    }
}

/**
 * Sends a first-sync data to the client in order to create the first dashboard update
 * 
 * @param client SocketIO client
 */
async function firstSync(client: Socket, data: any): Promise<void> {
    client.emit('my-event', data)
}

/**
 * Sends a SocketIO event to the room or client based in the given params.
 * 
 * - If `to` is set, it will be sent to this room.
 * - If `client` is set but also `to`, then `client` is ignored
 * - Set `to` to `null` if the message should be sent only to the given client. 
 * 
 * > Note that there's no acknowledgement to know if the message was really
 * received by the client.
 * 
 * ----
 * ### Usage Example
 * 
 * ```ts
 * import { config } from '@/config/config';
 * 
 * // Outscope socket client
 * let client = null;
 * 
 * // in connection function
 * config.io.on('connect',(ioClient) => {
 *      client = ioClient;
 *      client.on('message', (data) => {
 *          emit('message', {from: 'john', content: 'Hello!'}, 'jon-room');
 *      });
 * });
 * 
 * // Another scope
 * 
 * import { emit } from '@/modules/services/Socket.io';
 * function sendMessage(message: any, client: Socket){
 *      emit('message', message, null, client);
 * }
 * 
 * sendMessage({from: 'john', content: 'Hello!'}, client);
 * 
 * ```
 * 
 * @param event event name
 * @param data anything to send
 * @param to room name
 * @param client SocketIO Client
 */
export function emit(event: string, data: any, to?: string, client?: Socket): void {
    // Checks if the SocketIO global instance is set so we are able to send messages
    if (config.io) {
        try {
            // If to is set, then prioritize it
            if (to) {
                config.io.to(to).emit(event, data);
                // Else checks if the client is set to send a private message
            } else if (client) {
                client.emit(event, data);
            } else {
                // If the global instance is not set, then throws an error
                throw new Error('Neither room name or client was set.');
            }
        } catch (error) {
            throw error;
        }
    }
}