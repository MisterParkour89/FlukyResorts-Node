import express from "express";
import { extraviosRepo } from '../repo/extravios.js';
import { sendMail } from '../Services/enviarCorreo.js';
import { convertirHtml } from "../Services/plantillasContenido.js";

const router = express.Router();

// GET /api/extravios - Obtener todos los extravíos
router.get('/', async (req, res, next) => {
  try {
    const extravios = await extraviosRepo.getExtravios();
    res.json(extravios);
  } catch (error) {
    console.error('Error al obtener extravíos:', error);
    next(error);
  }
});

// GET /api/extravios/:id - Obtener un extravío por ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const extravio = await extraviosRepo.getExtravio(id);
    if (!extravio.email) {
      return res.status(404).json({ error: 'Extravio no encontrado' });
    }
    res.json(extravio);
  } catch (error) {
    console.error('Error al obtener extravío:', error);
    next(error);
  }
});

// POST /api/extravios - Crear un nuevo extravío
router.post('/', async (req, res, next) => {
  const { descripcion, email, fecha, tipo, ubicacion } = req.body;



  if (!email || !fecha || !tipo || !ubicacion) {
    return res.status(400).json({ error: 'Faltan datos obligatorios para crear el extravío.' });
  }

  try {
    const nuevoExtravio = { descripcion, email, fecha, tipo, ubicacion };
    await extraviosRepo.createExtravios(nuevoExtravio);
    
    
    await sendMail({
      to:email,
      subject:'Confirmaciond de reporte de extravío',
      text: `Hola, hemos recibido tu reporte del objeto extraviado en: ${ubicacion}`,
      html: await convertirHtml('../Services/extravio.md',nuevoExtravio)
    });  
    console.log("Se envio el correo");

    res.status(201).json({ message: 'Extravío creado correctamente.' });

  } catch (error) {
    next(error);
    console.error('Error al crear extravío:', error);
  }
});

// PUT /api/extravios/:id - Actualizar extravío por ID
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    await extraviosRepo.updateExtravios(id, updatedData);
    res.status(200).json({ message: 'Extravío actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar extravío:', error);
    next(error);
  }
});

// DELETE /api/extravios/:id - Eliminar extravío por ID
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await extraviosRepo.deleteExtravios(id);
    res.status(200).json({ message: 'Extravío eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar extravío:', error);
    next(error);
  }
});



export default router;