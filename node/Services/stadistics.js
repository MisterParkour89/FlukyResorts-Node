
import { reservationsRepo } from '../repo/reservations.js'

async function getReservationsPerHotel(){
    // Recuperar todas las reservaciones
    // Generar un diccionario hotel: numReservaciones

    const reservations = await reservationsRepo.getReservations();

    let reservationPerHotel = {};

    reservations.forEach((rsv) => {
        if(!reservationPerHotel[rsv.hotel]){
            reservationPerHotel[rsv.hotel] = 1;
        }else{
            reservationPerHotel[rsv.hotel]++;
        }
    });
    

    return reservationPerHotel;
}


export default getReservationsPerHotel;