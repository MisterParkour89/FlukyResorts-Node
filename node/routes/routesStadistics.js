import getReservationsPerHotel  from '../Services/stadistics.js';
import express from 'express'


const router = express.Router();

// GET /api/stadistics/reservations -------------- Obtener todas la estadistica de las reservaciones por hotel
router.get('/reservations', async (req, res) => {
    try{
        const estadisticaJson = await getReservationsPerHotel();
        res.json(estadisticaJson);
    } catch (error){
        console.error("Error al obtener estadisticas: ", error);
        res.status(500).json("Server error");
    }
})



export default router;