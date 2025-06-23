import { hotelsRepo } from "./hotels.js";
import fs from 'fs';

// Test para crear hotel
// hotelsRepo.createHotel("Prueba2", hotel);

// Test para acceder por id
// const hotelRetured = await hotelsRepo.getHotel("1"); 
// console.log(hotelRetured);

// Test para recuperar todos los hoteles
const hoteles = await hotelsRepo.getHotels();
console.log(hoteles);

