import { extraviosRepo } from "./extravios.js";

// const extravios = await extraviosRepo.getExtravios();
// console.log(extravios);

// extraviosRepo.createExtravios({
//     email: 'miamole@gmail.com',
//     ubicacion: 'Hotel Oasis',
//     fecha: '2023-10-01',
//     tipo: 'Otro',
//     descripcion: 'Colonia de mango',
// });

const extravioReturned = await extraviosRepo.getExtravio("1");
console.log(extravioReturned);