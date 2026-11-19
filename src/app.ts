import express, { Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import Logger from './service/logger/index.js';
import errorHandler from './middleware/errorHandler.js';
import appRoute from './routes/app.route.js';
import ecommerceRoute from './routes/ecommerce/ecommerce.route.js';
import handleNewRecord from './components/device/handleNewRecord.js';
import ServerEvent from './service/event/index.js';
import constant from './config/constant.js';
import Vars from './config/var.js';

ServerEvent.on('newRecord', handleNewRecord);

const app = express();

app.use(morgan(':method :url Status : :status, Time taken: :response-time ms', {
  stream: { write: (message) => Logger.info(message) },
}));

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function handNewRecordController(req: Request, res: Response) {

  console.log('new hardware record :', req.body);
  const { imei, timestamp, signal_strength, adc_channels } = req.body;

  const [datePart, timePart] = timestamp.split('+')[0].split(',');
  const [yy, mm, dd] = datePart.split('/').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);

  const year = 2000 + yy;
  const month = mm - 1;
  const day = dd;

  // Convert IST (UTC+05:30) components to a UTC Date
  const istOffsetMinutes = (5 * 60) + 30;
  const utcMs = Date.UTC(year, month, day, hour, minute, second) - (istOffsetMinutes * 60 * 1000);
  const date = new Date(utcMs);

  console.log('new hardware imei :', imei);

  const newRecord = {
    imei,
    timestamp: date,
    priority: 0,
    event_trigger_id: 0,
    gps: {
      latitude: 0,
      longitude: 0,
      altitude: 0,
      angle: 0,
      satellites: 0,
      speed: 0,
    },
    io_elements: { ...adc_channels, 21: signal_strength },
  };

  handleNewRecord(newRecord);

  res.status(204).end();
}

// Health check route
const serverStartTimeStamp = new Date().toISOString();

app.get('/ping', (req, res) => {
  res.status(200).send('pont');
});

// Status route
app.get('/status', (req, res) => {
  res.status(200).json({
    status: 'OK',
    version: '1.0.0',
    startTime: serverStartTimeStamp,
    service: Vars.serviceName,
    codeSign: 'R.P.Raiyani',
  });
});

app.post('/api/test', handNewRecordController);

app.use('/files', express.static(constant.fileStoragePath));

// API routes
app.use('/api', appRoute);

// Alert format 1 route
app.post('/v1/aalrt/format/1', handNewRecordController);

// API routes
app.use('/ecommerce-api', ecommerceRoute);

// Error handler
app.use(errorHandler);

export default app;
