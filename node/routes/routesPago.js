import express from 'express';
import { crearPreferencia } from '../Services/mercadoPagoController.js';  // Asegúrate de importar la función correctamente

const router = express.Router();

router.get("/mercado", (req, res) => {
  res.send("funciona");
});

// Definir la ruta POST para crear el pago
router.post('/crear-pago', crearPreferencia);

export default router;