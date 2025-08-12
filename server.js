require('dotenv').config(); //carga variables de entorno desde .env

//Carga de librerías necesarias
const express = require('express'); //framework para crear el servidor
const cors = require('cors'); //evita bloqueo de seguridad entre dominios- Permite que el frontend y backend se comuniquen
const bodyParser = require('body-parser'); //permite leer datos enviados en el body de una solicitud (ej formulario)
const nodemailer = require('nodemailer');//permite enviar correos electrónicos desde el servidor


//Creando y configurando la app(servidor)
const app = express(); //inicializa el servidor Express
app.use(cors()); //Permite que react(cliente) hable con mi backend
app.use(bodyParser.json());//Permite que el backend entienda los datos JSON que envía el formulario


//Ruta para manejar el envío del formulario
app.post('/send', async (req, res) => {  //Crea una ruta que escucha cuando el frontend hace un POST a /send
  
  //contiene los datos del formulario enviados desde react
  const { nombre, apellido, telefono, email, mensaje } = req.body; 

  //Configuración del transporte del correo electrónico
  const transporter = nodemailer.createTransport({//crea una conexión al servidor SMTP(en este caso, gmail)
    host: 'smtp.gmail.com', //servidor SMTP de Gmail
    port: 465, //puerto para conexiones seguras
    secure: true, //false para conexiones no seguras (true para conexiones seguras)// true para 465, false para 587
    //service: 'gmail', // o smtp de otro proveedor
    auth: {//credenciales guardadas en variables de entorno
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls:{
       rejectUnauthorized: false, // evita errores por certificados 
    },
  });

  //Datos que se van a enviar en el correo electrónico
  const mailOptions = {
    from: email,
    to: process.env.CLIENT_EMAIL,
    subject: 'NUEVO MENSAJE DE FORMULARIO',
    text: `Nombre: ${nombre} ${apellido}\nTeléfono: ${telefono}\nEmail: ${email}\nMensaje: ${mensaje}`,
  };

  //Se intenta enviar el email, si sale bien responde con éxito, si falla responde con error si no lo captura y responde con mensaje de error
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(500).send({ success: false, error });
  }
});

//Ruta de prueba para verificar que el servidor está funcionando
app.listen(3001, () => {
  console.log('Servidor funcionando en puerto 3001');
});
