import express from "express";
import { reservationsRepo } from "../repo/reservations.js";
import { sendMail } from "../Services/enviarCorreo.js";
import { convertirHtml } from "../Services/plantillasContenido.js";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import fs from "fs";

const router = express.Router();
const doc = new PDFDocument();

// GET /api/reservaciones --------Obtener todas las reservaciones
router.get("/", async (req, res, next) => {
  try {
    const reservas = await reservationsRepo.getReservations();
    res.json(reservas);
  } catch (error) {
    console.error("Error al obtener reservaciones:", error);
    next(error);
  }
});

// GET /api/reservaciones/:id --------- Obtener una reservacion por ID
router.get("/:id", async (req, res, next) => {
  try {
    const reserva = await reservationsRepo.getReservation(req.params.id);
    if (!reserva || Object.keys(reserva).length === 0) {
      return res.status(404).json({ mensaje: "Reservación no encontrada" });
    }
    res.json(reserva);
  } catch (error) {
    console.error("Error al obtener reservación:", error);
    next(error);
  }
});

// GET /reservaciones/:UserId --------- Obtener reservaciones por ID de usuario
router.get("/user/:UserId", async (req, res, next) => {
  try {
    const { UserId } = req.params;
    const reservas = await reservationsRepo.getReservationsByUserId(UserId);
    if (!reservas || reservas.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "No se encontraron reservaciones para este usuario" });
    }
    res.json(reservas);
  } catch (error) {
    console.error("Error al obtener reservaciones por usuario:", error);
    next(error);
  }
});

// POST /api/reservaciones ----- Crear nueva reservación
router.post("/", async (req, res, next) => {
  console.log("Entra a Api Crear Reservacion");
  try {
    const datosReserva = req.body;
    const { nombre, email, fecha_llegada, fecha_salida, hotel } = req.body;
    await reservationsRepo.createReservation(datosReserva);
    res.status(201).json({ mensaje: "Reservación creada exitosamente" });

    await sendMail({
      to: email,
      subject: "Confirmaciond de reserva",
      text: `Hola, hemos recibido tu reserva para el hotel: ${hotel}`,
      html: await convertirHtml("../Services/reservacion.md", datosReserva),
    });
    console.log("Se envio el correo");
  } catch (error) {
    console.error("Error al crear reservación:", error);
    next(error);
  }
});

//DELETE     /api/reservaciones/:id   --------     Elimina una reservacion por ID
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await reservationsRepo.deleteReservation(id);
    res.json({ mensaje: `Reservación con ID ${id} eliminada correctamente` });
  } catch (error) {
    console.error("Error al eliminar reservación:", error);
    next(error);
  }
});

// PUT /api/reservaciones/:id --------- Actualizar una reservación por ID
router.put("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const datosActualizados = req.body;

    await reservationsRepo.updateReservation(id, datosActualizados);

    res.status(200).json({ mensaje: "Reservación actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar reservación:", error);
    next(error);
  }
});

// /api/reservaciones/ticket/generate-qr Ruta que genera solo la imagen QR con un token dinámico
router.get("/ticket/generate-qr", async (req, res) => {
  try {
    // Obtener el parámetro base de la URL
    const base = req.query.base;

    // Generar un token único
    const token =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    const dynamicUrl = `${base}&token=${token}`;

    // Generar imagen como buffer PNG
    const qrCodeBuffer = await QRCode.toBuffer(dynamicUrl);

    // Enviar la imagen con el tipo de contenido correcto
    res.setHeader("Content-Type", "image/png");
    res.send(qrCodeBuffer);
  } catch (err) {
    console.error("Error generating QR code:", err);
    res.status(500).send("Internal Server Error");
  }
});

// /api/reservaciones/ticket/generate-ticket
router.get("/ticket/generate-ticket", async (req, res) => {
  try {
    const { nombre, email, fecha_llegada, fecha_salida, hotel } = req.query;

    if (!nombre || !email || !fecha_llegada || !fecha_salida || !hotel) {
      return res.status(400).send("Faltan datos para generar el ticket");
    }

    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="ticket.pdf"');
      res.send(pdfBuffer);
    });

    // ======== ESTILO DEL TICKET =========
    doc
      .fillColor("#1f2937")
      .fontSize(26)
      .text("Ticket de Reservación", { align: "center" });

    doc.moveDown(1);

    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#9ca3af").stroke();

    doc.moveDown(1.2);
    doc.fontSize(16).fillColor("#111827");

    doc.text(`Hotel: ${hotel}`, { continued: false });
    doc.text(`Nombre: ${nombre}`);
    doc.text(`Email: ${email}`);
    doc.text(`Fecha de entrada: ${fecha_llegada}`);
    doc.text(`Fecha de salida: ${fecha_salida}`);

    doc.moveDown();
    doc
      .fontSize(12)
      .fillColor("#6b7280")
      .text("Gracias por reservar con nosotros.");

    // Finalizar
    doc.end();
  } catch (error) {
    console.error("Error al generar el ticket:", error);
    res.status(500).send("Error al generar el ticket");
  }
});

export default router;
