import express from "express";
import { hotelsRepo } from "../repo/hotels.js";
import { sendMail } from '../Services/enviarCorreo.js';

const router=express.Router();

//GET    /api/hoteles/     -------------       Obtiene todos los hoteles
router.get('/', async (req, res) => {
    try {
        const hotels = await hotelsRepo.getHotels();
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener hoteles' });
    }
});

//GET    /api/hoteles/:id        -------------   Obtiene un hotel por if
router.get('/:id', async (req, res) => {
    try {
        const {id}=req.params;
        const hotels = await hotelsRepo.getHotel(id);

        if(!hotels.nombre){
            return res.status(404).json({ error: 'Extravio no encontrado' });
        }

        res.json(hotels);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener hoteles' });
    }
});



// POST /api/hoteles/
router.post('/', async (req, res) => {
    const { nombre, precio, ubicacion, rating, imagenUrl, descripcion } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!nombre || !precio || !ubicacion || !rating || !imagenUrl || !descripcion) {
        return res.status(400).json({ error: 'Faltan datos obligatorios para crear el hotel.' });
    }

    try {
        const nuevoHotel = { nombre, precio, ubicacion, rating, imagenUrl, descripcion };
        await hotelsRepo.createHotel(nuevoHotel);
        res.status(201).json({ message: 'Hotel creado correctamente.' });
    } catch (error) {
        console.error('Error al crear hotel:', error);
        res.status(500).json({ error: 'Error al crear hotel.' });
    }
});

// PUT /api/hotels/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        await hotelsRepo.updateHotel(id, updatedData);
        res.status(200).json({ message: 'Hotel actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar hotel:', error);
        res.status(500).json({ error: 'Error al actualizar hotel' });
    }
});

// delete /api/hotels/:id   ------------------ Elimina hotel por id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await hotelsRepo.deleteHotel(id);
        res.status(200).json({ message: 'Hotel eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar hotel:', error);
        res.status(500).json({ error: 'Error al eliminar hotel' });
    }
});





export default router;