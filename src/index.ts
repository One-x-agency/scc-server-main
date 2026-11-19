import http from 'http';
import Vars from './config/var.js';
import app from './app.js';
import Logger from './service/logger/index.js';
import Socket from './service/socket/index.js';
// import codecServer from './service/codec/codecServer.js';

const { port, env } = Vars;

const server = http.createServer(app);

Socket.listen(server);

server.listen(port, () => {
  Logger.info(`Server is running on port ${port} in ${env} mode`);
});

// const codecServerPort = 3210;

// codecServer.listen(codecServerPort, () => {
//   Logger.info(`Codec server is running on port ${codecServerPort}`);
// });
