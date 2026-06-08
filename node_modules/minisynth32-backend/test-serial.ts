import { SerialService } from './src/services/serial/SerialService.js';
const s = new SerialService({baudRate: 115200});
s.onStatus(console.log);
s.start().catch(console.error);
