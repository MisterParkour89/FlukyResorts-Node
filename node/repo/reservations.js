import { HttpError } from "../utils/httpError.js";
import { db } from "./database.js";

export const reservationsRepo = {
  /**
   * Retrieves all reservations from the Firestore 'reservations' collection.
   *
   * @async
   * @function
   * @returns {Promise<Array<Reservation>>} Resolves to an array of reservation objects, each containing the document ID and reservation data.
   */
  async getReservations() {
    const snapshot = await db.collection("reservations").get();
    let reservations = snapshot.docs
      .filter((doc) => doc.id !== "indexID") // No incluir el indexID
      .map((doc) => ({ id: doc.id, ...doc.data() })) // Mapear solo los válidos
      .sort((a, b) => Number(a.id) - Number(b.id)); // Ordenar por id

    return reservations;
  },

  /**
   * Creates a new reservation entry in the database with a unique incremental ID.
   * Updates the indexID to ensure unique IDs for future reservations.
   *
   * @async
   * @param {Object} reservation - The reservation data to be stored in the database.
   * @returns {Promise<void>} Resolves when the reservation has been created and the index updated.
   */
  async createReservation(reservation) {
    // Quitar id si lo tiene
    delete reservation.id;
    // Validación
    const hotelesSnapshot = await db.collection("hotels").get();
    const hotelesValidos = hotelesSnapshot.docs.map((doc) => doc.data().nombre);
    const campos = ["hotel", "nombre", "email", "fechaEntrada", "fechaSalida"];
    for (let campo of campos) {
      if (!reservation[campo]) {
        throw new Error(`El campo ${campo} es obligatorio.`);
      }
    }

    if (!hotelesValidos.includes(reservation.hotel)) {
      throw new HttpError(400, `El hotel ${reservation.hotel} no es válido.`);
    }
    // Obtener todos los documentos y calcular el ID más alto
    const snapshot = await db.collection("reservations").get();
    let maxId = 0;

    snapshot.forEach((doc) => {
      const docId = parseInt(doc.id);
      if (!isNaN(docId) && docId > maxId) {
        maxId = docId;
      }
    });
    // TODO: aqui no se esta usando indexID, se usa un algoritmo diferente que puede alterar la consistencia de los datos
    // Cambiar.
    const newId = String(maxId + 1);

    // Guardar nueva reservación
    await db.collection("reservations").doc(newId).set(reservation);
  },

  /**
   * Retrieves a specific reservation document from the 'reservations' collection of the Firestore database.
   *
   * @async
   * @param {string} id - The unique identifier of the reservation document.
   * @returns {Promise<Object>} Resolves to an object containing the reservation data and its document ID.
   */
  async getReservation(id) {
    if (typeof id !== "string") id = String(id);
    const docRef = db.collection("reservations").doc(id);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  },

  /**
   * Deletes a reservation document from the 'reservations' collection in Firestore.
   *
   * @async
   * @param {string} id - The unique identifier of the reservation to delete.
   * @returns {Promise<void>} Resolves when the reservation has been deleted.
   */
  async deleteReservation(id) {
    if (typeof id !== "string") id = String(id);
    const docRef = db.collection("reservations").doc(id);
    await docRef.delete();
  },
  /**
   * Updates an existing reservation document in the 'reservations' collection.
   *
   * @async
   * @param {string} id - The unique identifier of the reservation to update.
   * @param {Object} updatedData - The reservation fields to update.
   * @returns {Promise<void>}
   */
  async updateReservation(id, updatedData) {
    if (!id || typeof id !== "string") {
      throw new Error("ID inválido");
    }

    if (
      !updatedData.nombre ||
      !updatedData.email ||
      !updatedData.fechaEntrada ||
      !updatedData.fechaSalida
    ) {
      throw new Error("Datos incompletos para la actualización");
    }

    const docRef = db.collection("reservations").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error(`No existe una reservación con el ID: ${id}`);
    }

    // Sobrescribe completamente el documento
    await docRef.set(updatedData);
  },

  async getReservationsByUserId(userId) {
    if (typeof userId !== "string") userId = String(userId);

    const snapshot = await db
      .collection("reservations")
      .where("uid", "==", userId)
      .get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
};
