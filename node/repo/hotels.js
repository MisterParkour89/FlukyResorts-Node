import { strict } from 'assert';
import { db } from './database.js';

export const hotelsRepo = {
    /**
     * Retrieves all hotels from the Firestore 'hotels' collection.
     *
     * @async
     * @function
     * @returns {Promise<Array<Hotel>>} Resolves to an array of hotel objects, each containing the document ID and hotel data.
     */
    async getHotels() {
        const snapshot = await db.collection('hotels').get();

        const hotels = snapshot.docs
            .filter(doc => doc.id !== 'indexID')                      // No incluir el indexID
            .map(doc => ({ id: doc.id, ...doc.data() }))              // Mapear solo los válidos
            .sort((a, b) => Number(a.id) - Number(b.id));             // Ordenar por id 

        return hotels;
    },
    /**
     * Creates a new hotel entry in the database with a unique incremental ID.
     * Updates the indexID to ensure unique IDs for future hotels.
     * 
     * @async
     * @param {Object} hotel - The hotel data to be stored in the database.
     * @returns {Promise<void>} Resolves when the hotel has been created and the index updated.
     */
    async createHotel(hotel) {
        // Obtener el id del nuevo documento
        const docIds = db.collection('hotels').doc('indexID');
        const { id } = (await docIds.get()).data()
        const newId = id + 1;
        const strNewStr = String(newId);

        // Crear el nuevo elemento en la base de datos
        const docRef = db.collection('hotels').doc(strNewStr);
        await docRef.set(hotel);
        // Actualizar el indexID con el nuevoID
        await docIds.set({ id: newId });
    },
    /**
     * Reference to a specific hotel document in the 'hotels' collection of the Firestore database.
     * 
     * @async
     * @type {promise to a domain Hotel object}
     * @param {string} id - The unique identifier of the hotel document.
     */
    async getHotel(id) {
        if (typeof (id) !== String) id = String(id);
        const docRef = db.collection('hotels').doc(id);
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    },
    /**
 * Deletes a hotel from the Firestore 'hotels' collection by ID.
 * 
 * @async
 * @param {string} id - The unique identifier of the hotel document to delete.
 * @returns {Promise<void>} Resolves when the hotel document has been deleted.
 */
    async deleteHotel(id) {
        if (typeof (id) !== 'string') id = String(id);
        await db.collection('hotels').doc(id).delete();
    },

    /**
     * Updates a hotel document in the Firestore 'hotels' collection.
     * 
     * @async
     * @param {string} id - The unique identifier of the hotel to update.
     * @param {Object} updatedData - An object containing the fields to update.
     * @returns {Promise<void>} Resolves when the hotel has been updated.
     */
    async updateHotel(id, updatedData) {
        if (typeof (id) !== 'string') id = String(id);
        await db.collection('hotels').doc(id).update(updatedData);
    }

}

