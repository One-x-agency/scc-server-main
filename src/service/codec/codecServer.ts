import net from 'net';
import { ProtocolParser, parseIMEI, Data, AVL_Data } from 'complete-teltonika-parser';
import ServerEvent from '@/service/event/index.js';
import Logger from '@/service/logger/index.js';
// import socket from '@/service/socket/index.js';
import { Record } from '@/types/device.type.js';

function processPacket(packet: string) {
  if (packet.length === 34) {
    return { imei: parseIMEI(packet) };
  }
  return { dataPacket: new ProtocolParser(packet) };
}

function formateRecord(imei: string, record: AVL_Data): Record {

  return {
    imei,
    timestamp: record.Timestamp,
    priority: record.Priority,
    event_trigger_id: record.IOelement.EventID,
    gps: {
      latitude: record.GPSelement.Latitude,
      longitude: record.GPSelement.Longitude,
      altitude: record.GPSelement.Altitude,
      angle: record.GPSelement.Angle,
      satellites: record.GPSelement.Satellites,
      speed: record.GPSelement.Speed,
    },
    io_elements: record.IOelement.Elements as { [key: string]: number },
  };
}

const server = net.createServer((c) => {
  console.log('client connected');
  let imeiNumber;

  c.on('end', () => { console.log('client disconnected :', imeiNumber); });
  c.on('close', () => { console.log('client closed :', imeiNumber); });

  c.on('timeout', () => {
    Logger.warn('codec server timed out');
    c.end(); // Close gracefully
  });

  c.on('error', () => {
    Logger.error('codec server error:');
    c.destroy(); // Ensure it closes
  });

  c.on('data', (data) => {
    // converting buffer to hexadecimal string
    const packet = data.toString('hex');

    // parse the data packet
    let parsedPacket: ReturnType<typeof processPacket>;
    try {

      parsedPacket = processPacket(packet);

    } catch (error) {
      Logger.error('error processing packet:', error);
      c.write(Buffer.alloc(1, 0));
      return;
    }
    const { imei, dataPacket } = parsedPacket;

    if (imei) {
      // send acknowledgement for imei packet (1 byte)
      c.write(Buffer.alloc(1, 1));
      console.log('imei', imei);
      imeiNumber = imei;
    } else {
      const avl = dataPacket.Content as Data;

      // send the number of records in the packet for acknowledgement (4 bytes)
      const responseBuffer = Buffer.alloc(4);
      responseBuffer.writeInt32BE(avl.AVL_Datas.length, 0);
      Logger.debug('responseBuffer', responseBuffer.toString('hex'));
      c.write(responseBuffer);

      const formattedRecord = formateRecord(imeiNumber, avl.AVL_Datas[0]);
      Logger.debug('formattedRecord', formattedRecord);

      ServerEvent.emit('newRecord', formattedRecord);
    }
  });
});

server.on('error', (err) => {
  Logger.error('Server error:', err);
});

export default server;
