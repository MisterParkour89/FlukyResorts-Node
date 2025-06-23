import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { db } from "./database.js";
import { getAuth } from "firebase-admin/auth";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("funciona");
});

// Datos extras para la base de datos
app.post("/api/extra-data", async (req, res) => {
  const { idToken, nombre, proveedor } = req.body;
  if (!idToken || !nombre) {
    return res.status(400).json({ message: "Faltan datos" });
  }
  try {
    // Verifica el idToken recibido desde el frontend
    const idDecod = await getAuth().verifyIdToken(idToken);
    const uid = idDecod.uid;
    const email = idDecod.email;

    // Si no viene proveedor ponemos e mail
    let proveedorFinal = proveedor;
    if (!proveedorFinal) {
      proveedorFinal = idDecod.firebase?.sign_in_provider || "email";
    }

    // Si el usuario ya existe solo actualizamos nombre y proveedor si cambio
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      await userRef.update({
        nombre,
        proveedor: proveedorFinal,
      });
    } else {
      // Si es nuevo crea todo el doc
      await userRef.set({
        nombre,
        email,
        rol: "usuario",
        intentosFallidos: 0,
        bloqueado: false,
        proveedor: proveedorFinal,
      });
    }

    res.status(200).json({ message: "Datos extra guardados correctamente" });
  } catch (error) {
    res
      .status(401)
      .json({
        message: "Token invalido o error al guardar datos",
        error: error.message,
      });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password, captchaToken } = req.body;
  if (!email || !password || !captchaToken) {
    return res
      .status(400)
      .json({ message: "Email, contraseña y captcha requeridos." });
  }

  // Validar captcha
  const secretKey = "6LeETE8rAAAAAMjR4LWTAerAI1ZTN3iW4MlKwEU_"; // SECRET KEY CAMBIAR DE AQUI
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
  const captchaRes = await fetch(verifyUrl, { method: "POST" });
  const captchaJson = await captchaRes.json();

  if (!captchaJson.success) {
    return res
      .status(400)
      .json({ message: "Fallo en la verificacion de reCAPTCHA" });
  }

  const usersRef = db.collection("users");
  const userSnap = await usersRef.where("email", "==", email).limit(1).get();

  if (userSnap.empty) {
    return res
      .status(401)
      .json({
        message: "Usuario o contraseña incorrectos",
        intentosRestantes: 2,
      });
  }

  const userDoc = userSnap.docs[0];
  const userData = userDoc.data();

  // Si ya esta bloqueado
  if (userData.bloqueado) {
    return res.status(403).json({
      message:
        "Cuenta bloqueada por intentos fallidos, haz clic para desbloquear cambiando contraseña",
      bloqueada: true,
    });
  }

  // Intenta autenticar con Firebase Auth 
  try {
    const response = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAtzHHOZ_YPiRPTDZUPOAW-t_z23EzXi1s", // API KEY CAMBIAR DE AQUI
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );
    const data = await response.json();

    if (data.error) {
      // Intento fallido
      let nuevosIntentos = (userData.intentosFallidos || 0) + 1;
      let bloqueado = false;
      if (nuevosIntentos >= 3) {
        bloqueado = true;
      }
      await usersRef.doc(userDoc.id).update({
        intentosFallidos: nuevosIntentos,
        bloqueado,
      });
      return res.status(401).json({
        message: bloqueado
          ? "Cuenta bloqueada por intentos fallidos, haz clic para desbloquear cambiando contraseña"
          : `Usuario o contraseña incorrectos. Intento ${nuevosIntentos}/3. Te quedan ${
              3 - nuevosIntentos
            } intento(s).`,
        intentosRestantes: Math.max(0, 3 - nuevosIntentos),
        bloqueada: bloqueado,
      });
    }

    // Login correcto resetea intentos y desbloquea
    await usersRef.doc(userDoc.id).update({
      intentosFallidos: 0,
      bloqueado: false,
    });

    return res.status(200).json({
      message: "Login correcto",
      idToken: data.idToken,
      nombre: userData.nombre,
      rol: userData.rol,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error interno", error: error.message });
  }
});

app.post("/api/unlock-account", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email requerido" });
  }
  try {
    const usersRef = db.collection("users");
    const userSnap = await usersRef.where("email", "==", email).limit(1).get();
    if (userSnap.empty) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const userDoc = userSnap.docs[0];
    await usersRef.doc(userDoc.id).update({
      intentosFallidos: 0,
      bloqueado: false,
    });
    return res.status(200).json({ message: "Cuenta desbloqueada" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al desbloquear", error: error.message });
  }
});

app.post("/api/login-phone", async (req, res) => {
  const { celular } = req.body;
  if (!celular) {
    return res.status(400).json({ message: "Celular requerido" });
  }
  try {
    // Verifica si el celular ya existe en la base de datos
    const usersRef = db.collection("users");
    const userSnap = await usersRef
      .where("celular", "==", celular)
      .limit(1)
      .get();
    if (userSnap.empty) {
      // Si es nuevo, crea usuario con proveedor: "telefono"
      await usersRef.add({
        celular,
        rol: "usuario",
        intentosFallidos: 0,
        bloqueado: false,
        proveedor: "telefono",
      });
    } 
    res.status(200).json({ message: "Login por teléfono correcto" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al registrar usuario por teléfono",
        error: error.message,
      });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
