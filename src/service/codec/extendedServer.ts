import net from 'net';
import Parser from 'teltonika-parser-extended';
import binutils from 'binutils64';
import socket from '@/service/socket/index.js';
// import store from '@/service/store.js';

function formatRecord(data) {
  const utcTimeZone = new Date(data.timestamp);
  const istDate = new Date(utcTimeZone.getTime() + (5.5 * 60 * 60 * 1000));

  const IndianTime = `${istDate.getDate()}-${istDate.getMonth() + 1}-${istDate.getFullYear()} ${istDate.getHours()}:${istDate.getMinutes()}:${istDate.getSeconds()}`;
  const gpsData = data.gps;
  const ioElementsData = data.ioElements.reduce((res, record) => ({
    ...res,
    [record.label]: record.value,
  }), {});

  return {
    timestamp: IndianTime,
    gps: gpsData,
    priority: data.priority,
    ioElements: ioElementsData,
  };
}

const server = net.createServer((c) => {
  console.log('client connected');
  c.on('end', () => {
    console.log('client disconnected');
  });

  c.on('data', (data) => {
    const buffer = data;
    const parser = new Parser(buffer);
    let imei_number;

    if (parser.isImei) {
      imei_number = parser.imei;

      c.write(Buffer.alloc(1, 1));
      console.log('imei', imei_number);
    } else {
      const avl = parser.getAvl();

      console.log('record lenght', avl.records.length);
      console.log('number of data', avl.number_of_data);

      const writer = new binutils.BinaryWriter();
      writer.WriteInt32(avl.number_of_data);

      const response = writer.ByteBuffer;
      console.log('response', response.toString('hex'));
      c.write(response);
      // if (avl.records.length > 0) {
      //   const latestRecord = avl.records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      //   const formattedRecord = formatRecord(latestRecord);

      //   socket.io.emit('record', { ...formattedRecord, imei_number });
      //   console.log('record', formattedRecord);
      // }
    }
  });
});

export default server;
