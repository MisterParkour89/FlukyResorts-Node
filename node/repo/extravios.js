import { HttpError } from '../utils/httpError.js';
import { db } from './database.js';


export const extraviosRepo = {
  /**
   * Retrieves all extravios from the Firestore 'extravios' collection.
   *
   * @async 
   * @function
   * @returns {Promise<Array<Extravios>>} Resolves to an array of extravios objects, each containing the document ID and extravios data.
   */
  async getExtravios() {

    const snapshot = await db.collection('extravios').get();
    let extravios = snapshot.docs
      .filter(doc => doc.id !== 'indexID')                      // No incluir el indexID
      .map(doc => ({ id: doc.id, ...doc.data() }))              // Mapear solo los válidos
      .sort((a, b) => Number(a.id) - Number(b.id));             // Ordenar por id 

    return extravios;
  },
  /**
   * Creates a new extravio entry in the database with a unique incremental ID.
   * Updates the indexID to ensure unique IDs for future extravios.
   * 
   * @async
   * @param {Object} extravio - The extravio data to be stored in the database.
   * @returns {Promise<void>} Resolves when the extravio has been created and the index updated.
   */
  async createExtravios(extravios) {
    //Obtener hoteles
    const hotelesSnapshot = await db.collection('hotels').get();
    const hotelesValidos = hotelesSnapshot.docs.map(doc => doc.data().nombre);

    if (!hotelesValidos.includes(extravios.ubicacion)) {
      throw new HttpError(400, `El hotel ${extravios.ubicacion} no es válido.`);
    }

    // Obtener el id del nuevo documento

    const docIds = db.collection('extravios').doc('indexID');
    const { id } = (await docIds.get()).data()
    const newId = id + 1;
    const strNewStr = String(newId);

    // Crear el nuevo elemento en la base de datos
    const docRef = db.collection('extravios').doc(strNewStr);
    await docRef.set(extravios);
    // Actualizar el indexID con el nuevoID
    await docIds.set({ id: newId });


  },

  /**
   * Reference to a specific extravio document in the 'extravios' collection of the Firestore database.
   * 
   * @async
   * @type {promise to a domain Extravios object}
   * @param {string} id - The unique identifier of the extravio document.
   */

  async getExtravio(id) {
    if (typeof (id) !== String) id = String(id);
    const docRef = db.collection('extravios').doc(id);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  },
  /**
 * Elimina un extravio por su ID.
 * @param {string} id - ID del documento a eliminar.
 * @returns {Promise<void>}
 */
  async deleteExtravios(id) {
    if (typeof id !== 'string') id = String(id);
    const docRef = db.collection('extravios').doc(id);
    await docRef.delete();
  },

  /**
   * Actualiza un extravio por su ID con los datos proporcionados.
   * @param {string} id - ID del documento a actualizar.
   * @param {Object} data - Datos nuevos a actualizar.
   * @returns {Promise<void>}
   */
  async updateExtravios(id, data) {
    if (typeof id !== 'string') id = String(id);
    const docRef = db.collection('extravios').doc(id);
    await docRef.update(data);
  }
}

