import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import routesReservations from './routes/routesReservations.js';
import routesHotels from './routes/routesHotels.js';
import routesExtravios from './routes/routesExtravios.js';
import routesUsersAuth from './routes/routesUsersAuth.js';
import { errorHandler } from './utils/errorHandler.js';
import routesStadistics from './routes/routesStadistics.js';
import routesPago from './routes/routesPago.js';  


dotenv.config({ path: '.secrets/.env' }); 

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/api/reservaciones', routesReservations);
app.use('/api/hoteles', routesHotels);
app.use('/api/extravios', routesExtravios);
app.use('/api/stadistics', routesStadistics);
app.use(errorHandler);

app.use('/api', routesUsersAuth);

app.use('/api', routesPago); 

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});