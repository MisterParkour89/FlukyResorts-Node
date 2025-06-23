import dotenv from 'dotenv';
import mercadopago from 'mercadopago';

dotenv.config({ path: './.secrets/.env' });

// Configuracion del token que utilizaremos para conectar con la API
mercadopago.configure({
  access_token: process.env.APIMERCADOPAGO,
});


//Funcion que nos permitira manejar mandar el pago cuando una reserva es mandada
 export const crearPreferencia = async (req, res) => {
  console.log("Entra a API crearPreferencia")
  try {
    const { precio } = req.body;

    //validacion para saber si el precio es valido
    if (!precio || isNaN(precio)) {
      return res.status(400).json({ error: 'Precio inválido' });
    }

    //almacenamos en una constante los atributos a menejar de la reserva
    const preference = {
      items: [
        {
          title: "Reserva",
          unit_price: parseFloat(precio),
          quantity: 1,
        },
      ],
      //La api de mercado pago bloquea las rutas localhost, antes de hacer deploy cambiar las rutas
      back_urls: {
        success: 'https://www.google.com', // Links de pantallas cuando el pago sea realizado
        failure: 'https://www.google.com',
        pending: 'https://www.google.com',
      },
      auto_return: "approved",
    };

    //Salida en terminal
    console.log("Preferencia que se va a enviar:", preference);

    //Hacemos la peticion a nuestra api de mercado pago
    const response = await mercadopago.preferences.create(preference);
    res.json({ init_point: response.body.init_point });
  } catch (error) {
    //Mensaje de error con vista en terminal
    console.error("Error al crear preferencia:", error);
    res.status(500).json({ error: error.message });
  }
};

