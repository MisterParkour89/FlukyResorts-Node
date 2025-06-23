import { reservationsRepo } from "./reservations.js";


// const reservas = [
//     {
//         nombre: 'Martin Sergio Lopez Nieves',
//         email: 'exe@gmail.com',
//         fecha_llegada: '2023-10-01',
//         fecha_salida: '2023-10-05',
//         hotel: 'Hotel Oasis',
//     },
//     {
//         nombre: 'Lucia Fernandez Cruz',
//         email: 'luciaf@gmail.com',
//         fecha_llegada: '2023-10-03',
//         fecha_salida: '2023-10-06',
//         hotel: 'Hotel Central',
//     },
//     {
//         nombre: 'Carlos Ramirez Soto',
//         email: 'c.ramirez@gmail.com',
//         fecha_llegada: '2023-10-04',
//         fecha_salida: '2023-10-08',
//         hotel: 'Hotel Oasis',
//     },
//     {
//         nombre: 'Elena Ruiz Martínez',
//         email: 'elena.ruiz@gmail.com',
//         fecha_llegada: '2023-10-02',
//         fecha_salida: '2023-10-07',
//         hotel: 'Hotel Central',
//     },
//     {
//         nombre: 'Javier Torres Mendoza',
//         email: 'javier.torres@gmail.com',
//         fecha_llegada: '2023-10-05',
//         fecha_salida: '2023-10-10',
//         hotel: 'Hotel Oasis',
//     },
//     {
//         nombre: 'Mariana Gómez Díaz',
//         email: 'mariana.gomez@gmail.com',
//         fecha_llegada: '2023-10-06',
//         fecha_salida: '2023-10-09',
//         hotel: 'Hotel Central',
//     },
//     {
//         nombre: 'Diego Herrera Lozano',
//         email: 'diego.herrera@gmail.com',
//         fecha_llegada: '2023-10-07',
//         fecha_salida: '2023-10-11',
//         hotel: 'Hotel Oasis',
//     },
//     {
//         nombre: 'Ana María Rojas',
//         email: 'ana.rojas@gmail.com',
//         fecha_llegada: '2023-10-08',
//         fecha_salida: '2023-10-12',
//         hotel: 'Hotel Central',
//     },
//     {
//         nombre: 'Fernando Salinas',
//         email: 'f.salinas@gmail.com',
//         fecha_llegada: '2023-10-09',
//         fecha_salida: '2023-10-14',
//         hotel: 'Hotel Oasis',
//     },
//     {
//         nombre: 'Paula Navarro',
//         email: 'paula.navarro@gmail.com',
//         fecha_llegada: '2023-10-10',
//         fecha_salida: '2023-10-13',
//         hotel: 'Hotel Central',
//     },
//     {
//         nombre: 'Luis Alberto Méndez',
//         email: 'luis.mendez@gmail.com',
//         fecha_llegada: '2023-10-11',
//         fecha_salida: '2023-10-15',
//         hotel: 'Hotel Oasis',
//     }
// ];

// for (const reserva of reservas) {
//     await reservationsRepo.createReservation(reserva);
// }
const reservaciones = await reservationsRepo.getReservations();
console.log(reservaciones);