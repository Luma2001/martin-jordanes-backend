
require('dotenv').config(); //carga variables de entorno desde .env




const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});





require('dotenv').config(); //carga variables de entorno desde .env

//Carga de librerías necesarias
const express = require('express'); //framework para crear el servidor
const cors = require('cors'); //evita bloqueo de seguridad entre dominios- Permite que el frontend y backend se comuniquen
//const bodyParser = require('body-parser'); //permite leer datos enviados en el body de una solicitud (ej formulario)
//const nodemailer = require('nodemailer');//permite enviar correos electrónicos desde el servidor

const corsOptions = {
  origin: 'https://estudio-jordanes.vercel.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Requested-With'],
  credentials: true,
};



//Creando y configurando la app(servidor)
const app = express(); //inicializa el servidor Express

app.use(express.json()); //Para que entienda JSON. Es un Middleware moderno para JSON
app.use(express.urlencoded({ extended: true })); //Para que entienda datos codificados en URL (formularios  HTML)

//Permite que react(cliente) hable con mi backend
app.use(cors(corsOptions)); 
//app.use(bodyParser.json());//Permite que el backend entienda los datos JSON que envía el formulario. Forma antigua de hacerlo

//soporte para solicitudes OPTIONS (preflight) de CORS
app.options('/send', cors(corsOptions));

app.get('/', (req, res) => {
  res.setHeader("X-Backend-Status", "awake");//agrega un encabezado personalizado a la respuesta para que cron sepa que el backend está activo
  res.status(200).send("Backend activo y escuchando");
}); //Ruta para verificar que el servidor funciona


//Ruta para manejar el envío del formulario
app.post('/send', async (req, res) => {  //Crea una ruta que escucha cuando el frontend hace un POST a /send
  
  //contiene los datos del formulario enviados desde react
  const { nombre, apellido, telefono, email, mensaje } = req.body; 

  const messageData = {
  from: email, // el email del usuario que completó el formulario
  to: process.env.CLIENT_EMAIL,
  subject: 'NUEVO MENSAJE DE FORMULARIO DE SITIO WEB ESTUDIO MARTÍN JORDANES',
  text: `Nombre: ${nombre} ${apellido}\nTeléfono: ${telefono}\nEmail: ${email}\nMensaje: ${mensaje}`,
};

try {
  await mg.messages.create(process.env.MAILGUN_DOMAIN, messageData);
  res.status(200).send({ success: true });
} catch (error) {
  console.error("Error al enviar correo:", error.message);
  res.status(500).send({ success: false, error: error.message });
}


});


// //Ruta para manejar el envío del formulario con nodemailer
// app.post('/send', async (req, res) => {  //Crea una ruta que escucha cuando el frontend hace un POST a /send
  
//   //contiene los datos del formulario enviados desde react
//   const { nombre, apellido, telefono, email, mensaje } = req.body; 

//   //Configuración del transporte del correo electrónico
//   const transporter = nodemailer.createTransport({//crea una conexión al servidor SMTP(en este caso, gmail)
//     host: 'smtp.gmail.com', //servidor SMTP de Gmail
//     port: 465, //puerto para conexiones seguras
//     secure: true, //false para conexiones no seguras (true para conexiones seguras)// true para 465, false para 587
//     service: 'gmail', // o smtp de otro proveedor
//     auth: {//credenciales guardadas en variables de entorno
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//     tls:{
//        rejectUnauthorized: false, // evita errores por certificados 
//     },
//     debug: true, // muestra detalles de la conexión en la consola
//     logger: true, // muestra detalles de la conexión en la consola
//     // connectionTimeout: 10000, // 10 segundos
//   });

//   //Datos que se van a enviar en el correo electrónico
//   const mailOptions = {
//     from: email,
//     to: process.env.CLIENT_EMAIL,
//     subject: 'NUEVO MENSAJE DE FORMULARIO DE SITIO WEB ESTUDIO MARTÍN JORDANES',
//     text: `Nombre: ${nombre} ${apellido}\nTeléfono: ${telefono}\nEmail: ${email}\nMensaje: ${mensaje}`,
//   };

//   //Se intenta enviar el email, si sale bien responde con éxito, si falla responde con error si no lo captura y responde con mensaje de error
//   try {
//     console.log("Solicitud recibida desde:", req.headers.origin);
//     console.log("Intentando enviar correo a:", process.env.CLIENT_EMAIL);
//     await transporter.sendMail(mailOptions);
//     console.log("Correo enviado con éxito");
//     res.status(200).send({ success: true });
    
    
//   } catch (error) {
//     console.error("Error al enviar correo:", error.message);
//     res.status(500).send({ success: false, error: error.message });
//   }
// });



//Para verificar que el servidor está funcionando
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en puerto ${PORT}`);
});
