"use strict";

// GESTIÓN DE USUARIOS Y AUTENTICACIÓN (Basado en el diagrama de flujo)
let listaUsuarios = JSON.parse(localStorage.getItem("simtele_usuarios") || "[]");
let intentosFallidos = parseInt(localStorage.getItem("simtele_intentos") || "0");

// Si no hay usuarios por defecto, creamos uno de prueba (usuario: admin, pass: 123456)
if (listaUsuarios.length === 0) {
  listaUsuarios.push({ usuario: "admin", email: "admin@teleferico.bo", pass: "123456" });
  localStorage.setItem("simtele_usuarios", JSON.stringify(listaUsuarios));
}

// ARREGLOS DE LA APLICACIÓN
let mantenimientos = JSON.parse(localStorage.getItem("simtele_mantenimientos") || "[]");
let sensores = JSON.parse(localStorage.getItem("simtele_sensores") || "[]");
let medicionesViento = [];

const $ = (id) => document.getElementById(id);

function guardarDatos() {
  localStorage.setItem("simtele_mantenimientos", JSON.stringify(mantenimientos));
  localStorage.setItem("simtele_sensores", JSON.stringify(sensores));
}

function mostrarMensaje(elemento, mensaje, esExito = false) {
  elemento.textContent = mensaje;
  elemento.className = esExito ? "form-message success" : "form-message";
}

// CONTROL DE PANTALLAS DE AUTENTICACIÓN
$("linkShowRegister").addEventListener("click", (e) => {
  e.preventDefault();
  $("formLogin").style.display = "none";
  $("formRegister").style.display = "block";
  $("formRecovery").style.display = "none";
  $("authTitle").textContent = "Registro de Usuario";
  $("authSubtitle").textContent = "Crea tus credenciales de acceso";
});

$("linkBackLogin").addEventListener("click", (e) => {
  e.preventDefault();
  $("formRegister").style.display = "none";
  $("formLogin").style.display = "block";
  $("authTitle").textContent = "Iniciar Sesión";
  $("authSubtitle").textContent = "Sala de Control · Mi Teleférico";
});

$("linkShowRecovery").addEventListener("click", (e) => {
  e.preventDefault();
  $("formLogin").style.display = "none";
  $("formRecovery").style.display = "block";
  $("authTitle").textContent = "Recuperar Contraseña";
  $("authSubtitle").textContent = "Establece una nueva clave";
});

$("linkCancelRecovery").addEventListener("click", (e) => {
  e.preventDefault();
  $("formRecovery").style.display = "none";
  $("formLogin").style.display = "block";
  $("authTitle").textContent = "Iniciar Sesión";
  $("authSubtitle").textContent = "Sala de Control · Mi Teleférico";
});

// 1. REGISTRO DE USUARIO
$("formRegister").addEventListener("submit", function(e) {
  e.preventDefault();
  const user = $("regUser").value.trim();
  const email = $("regEmail").value.trim();
  const pass = $("regPass").value.trim();
  const msg = $("msgRegister");

  if (!user || !email || !pass) {
    mostrarMensaje(msg, "Complete todos los campos.");
    return;
  }
  if (pass.length < 6) {
    mostrarMensaje(msg, "La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  // Comprobar si ya existe
  if (listaUsuarios.some(u => u.usuario === user || u.email === email)) {
    mostrarMensaje(msg, "El usuario o correo ya está registrado.");
    return;
  }

  listaUsuarios.push({ usuario: user, email: email, pass: pass });
  localStorage.setItem("simtele_usuarios", JSON.stringify(listaUsuarios));
  mostrarMensaje(msg, "¡Registro exitoso! Ya puedes iniciar sesión.", true);
  
  setTimeout(() => {
    $("formRegister").reset();
    $("linkBackLogin").click();
  }, 1200);
});

// 2. INICIO DE SESIÓN (Con lógica de bloqueo de 4 errores)
$("formLogin").addEventListener("submit", function(e) {
  e.preventDefault();
  const userText = $("loginUser").value.trim();
  const passText = $("loginPass").value.trim();
  const msg = $("msgLogin");

  // Verificar si está bloqueado por 4 errores
  if (intentosFallidos >= 4) {
    mostrarMensaje(msg, "SISTEMA BLOQUEADO: Superó los 4 errores permitidos. Use '¿Olvidaste tu contraseña?' para restablecer el acceso.");
    return;
  }

  const usuarioEncontrado = listaUsuarios.find(u => (u.usuario === userText || u.email === userText) && u.pass === passText);

  if (usuarioEncontrado) {
    // ACCESO CONCEDIDO
    intentosFallidos = 0;
    localStorage.setItem("simtele_intentos", "0");
    localStorage.setItem("simtele_sesion_activa", usuarioEncontrado.usuario);

    $("authOverlay").style.display = "none";
    $("appContainer").style.display = "block";
    $("userBienvenida").textContent = `SESIÓN: ${usuarioEncontrado.usuario.toUpperCase()}`;
  } else {
    // CREDENCIALES INVÁLIDAS -> Sumar errores
    intentosFallidos++;
    localStorage.setItem("simtele_intentos", intentosFallidos.toString());
    
    let restantes = 4 - intentosFallidos;
    if (restantes > 0) {
      mostrarMensaje(msg, `Credenciales incorrectas. Le quedan ${restantes} intento(s) antes del bloqueo.`);
    } else {
      mostrarMensaje(msg, "BLOQUEO DE SEGURIDAD: 4 errores alcanzados. Cuenta bloqueada.");
    }
  }
});

// 3. RECUPERACIÓN / CAMBIO DE CONTRASEÑA ("Olvide mi contraseña")
$("formRecovery").addEventListener("submit", function(e) {
  e.preventDefault();
  const identifier = $("recUser").value.trim();
  const newPass = $("recNewPass").value.trim();
  const msg = $("msgRecovery");

  if (!identifier || !newPass) {
    mostrarMensaje(msg, "Complete todos los campos.");
    return;
  }
  if (newPass.length < 6) {
    mostrarMensaje(msg, "La nueva contraseña debe tener al menos 6 caracteres.");
    return;
  }

  const usuarioIdx = listaUsuarios.findIndex(u => u.usuario === identifier || u.email === identifier);

  if (usuarioIdx !== -1) {
    // Actualizar contraseña en el arreglo y localStorage
    listaUsuarios[usuarioIdx].pass = newPass;
    localStorage.setItem("simtele_usuarios", JSON.stringify(listaUsuarios));

    // Desbloquear intentos fallidos tras recuperar la contraseña con éxito
    intentosFallidos = 0;
    localStorage.setItem("simtele_intentos", "0");

    mostrarMensaje(msg, "¡Contraseña actualizada con éxito! Ya puede iniciar sesión.", true);
    setTimeout(() => {
      $("formRecovery").reset();
      $("linkCancelRecovery").click();
    }, 1500);
  } else {
    mostrarMensaje(msg, "No se encontró ningún usuario con ese nombre o correo.");
  }
});

// CERRAR SESIÓN
$("btnCerrarSesion").addEventListener("click", () => {
  localStorage.removeItem("simtele_sesion_activa");
  location.reload();
});

// Comprobar si ya había una sesión activa al recargar la página
window.addEventListener("DOMContentLoaded", () => {
  const sesionActiva = localStorage.getItem("simtele_sesion_activa");
  if (sesionActiva) {
    $("authOverlay").style.display = "none";
    $("appContainer").style.display = "block";
    $("userBienvenida").textContent = `SESIÓN: ${sesionActiva.toUpperCase()}`;
  }
});

// ==========================================
// MÓDULO 1: DETENCIÓN DE EMERGENCIA
// ==========================================
$("formEmergencia").addEventListener("submit", function(event) {
  event.preventDefault();
  const velocidadTexto = $("velocidadEmergencia").value.trim();
  const tiempoTexto = $("tiempoReaccion").value.trim();
  const error = $("errorEmergencia");

  if (velocidadTexto === "" || tiempoTexto === "") {
    mostrarMensaje(error, "Complete ambos campos.");
    return;
  }

  const velocidad = parseFloat(velocidadTexto);
  const tiempo = parseFloat(tiempoTexto);

  if (!Number.isFinite(velocidad) || !Number.isFinite(tiempo)) {
    mostrarMensaje(error, "Ingrese valores numéricos válidos.");
    return;
  }
  if (velocidad < 0 || velocidad > 120 || tiempo < 0 || tiempo > 30) {
    mostrarMensaje(error, "Velocidad: 0–120 km/h. Tiempo: 0–30 segundos.");
    return;
  }

  const distancia = (velocidad / 3.6) * tiempo;
  $("distanciaResultado").textContent = distancia.toFixed(2);

  const aviso = $("avisoEmergencia");
  if (distancia > 50) {
    aviso.textContent = "ALERTA: la distancia calculada supera el umbral ficticio de 50 m.";
    aviso.className = "notice danger";
  } else {
    aviso.textContent = "Distancia dentro del umbral didáctico de 50 m.";
    aviso.className = "notice";
  }

  mostrarMensaje(error, "Cálculo realizado correctamente.", true);
});

// ==========================================
// MÓDULO 2: MANTENIMIENTO
// ==========================================
$("formMantenimiento").addEventListener("submit", function(event) {
  event.preventDefault();
  const componente = $("componente").value.trim();
  const horasTexto = $("horasUso").value.trim();
  const estado = $("estadoMantenimiento").value;
  const error = $("errorMantenimiento");

  if (!componente || !horasTexto || !estado) {
    mostrarMensaje(error, "Complete todos los campos del mantenimiento.");
    return;
  }

  const horas = parseFloat(horasTexto);
  if (!Number.isFinite(horas) || horas < 0 || horas > 200000) {
    mostrarMensaje(error, "Las horas deben ser un número entre 0 y 200000.");
    return;
  }

  mantenimientos.push({ componente, horas, estado });
  guardarDatos();
  renderizarMantenimientos();
  this.reset();
  mostrarMensaje(error, "Registro agregado correctamente.", true);
});

function renderizarMantenimientos() {
  const tabla = $("tablaMantenimiento");
  tabla.innerHTML = "";

  if (mantenimientos.length === 0) {
    tabla.innerHTML = '<tr><td colspan="4" class="empty">Todavía no hay registros.</td></tr>';
  } else {
    mantenimientos.forEach((registro, indice) => {
      const fila = document.createElement("tr");
      const claseEstado = registro.estado === "Normal" ? "tag-normal" :
        registro.estado === "Revisión" ? "tag-revision" : "tag-urgent";

      const c1 = document.createElement("td");
      c1.textContent = registro.componente;
      const c2 = document.createElement("td");
      c2.textContent = registro.horas;
      const c3 = document.createElement("td");
      const etiqueta = document.createElement("span");
      etiqueta.className = "tag " + claseEstado;
      etiqueta.textContent = registro.estado;
      c3.appendChild(etiqueta);

      const c4 = document.createElement("td");
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "delete-btn";
      boton.textContent = "Eliminar";
      boton.addEventListener("click", () => eliminarMantenimiento(indice));
      c4.appendChild(boton);

      fila.append(c1, c2, c3, c4);
      tabla.appendChild(fila);
    });
  }

  const total = mantenimientos.length;
  $("contadorMantenimiento").textContent = total + (total === 1 ? " registro" : " registros");
  $("totalMantenimientos").textContent = total + (total === 1 ? " registro" : " registros");
}

function eliminarMantenimiento(indice) {
  mantenimientos.splice(indice, 1);
  guardarDatos();
  renderizarMantenimientos();
}

// ==========================================
// MÓDULO 3: VIENTO Y OSCILACIÓN
// ==========================================
$("formViento").addEventListener("submit", function(event) {
  event.preventDefault();
  const campos = document.querySelectorAll(".medicion-viento");
  const error = $("errorViento");
  medicionesViento = [];

  for (let i = 0; i < campos.length; i++) {
    const texto = campos[i].value.trim();
    const valor = parseFloat(texto);

    if (texto === "" || !Number.isFinite(valor) || valor < 0 || valor > 150) {
      mostrarMensaje(error, "La medición " + (i + 1) + " debe ser un número entre 0 y 150.");
      return;
    }
    medicionesViento.push(valor);
  }

  let suma = 0;
  let maximo = medicionesViento[0];

  for (let i = 0; i < medicionesViento.length; i++) {
    suma += medicionesViento[i];
    if (medicionesViento[i] > maximo) {
      maximo = medicionesViento[i];
    }
  }

  const promedio = suma / medicionesViento.length;
  $("promedioViento").textContent = promedio.toFixed(2) + " km/h";
  $("maximoViento").textContent = maximo + " km/h";
  $("listaViento").textContent = medicionesViento.join(", ") + " km/h";

  let clasificacion;
  if (promedio < 30) {
    clasificacion = "Baja";
  } else if (promedio < 60) {
    clasificacion = "Moderada";
  } else {
    clasificacion = "Alta";
  }

  $("clasificacionViento").textContent = clasificacion;
  const aviso = $("avisoViento");
  aviso.textContent = (promedio >= 60 ? "ALERTA: " : "Análisis completado. ") + "Clasificación descriptiva: " + clasificacion.toLowerCase() + ".";
  aviso.className = promedio >= 60 ? "notice danger" : promedio >= 30 ? "notice warning" : "notice";
  mostrarMensaje(error, "Se analizaron las cinco mediciones.", true);
});

// ==========================================
// MÓDULO 4: SENSORES
// ==========================================
$("formSensor").addEventListener("submit", function(event) {
  event.preventDefault();
  const codigo = $("codigoSensor").value.trim().toUpperCase();
  const tipo = $("tipoSensor").value;
  const lecturaTexto = $("lecturaSensor").value.trim();
  const error = $("errorSensor");

  const patronCodigo = /^SEN-\d{3}$/;

  if (!codigo || !tipo || !lecturaTexto) {
    mostrarMensaje(error, "Complete el código, tipo y lectura del sensor.");
    return;
  }
  if (!patronCodigo.test(codigo)) {
    mostrarMensaje(error, "Código inválido. Use el formato SEN-001.");
    return;
  }

  const lectura = parseFloat(lecturaTexto);
  if (!Number.isFinite(lectura)) {
    mostrarMensaje(error, "La lectura debe ser un valor numérico.");
    return;
  }

  if (sensores.some(sensor => sensor.codigo === codigo)) {
    mostrarMensaje(error, "Ese código de sensor ya está registrado.");
    return;
  }

  sensores.push({ codigo, tipo, lectura });
  guardarDatos();
  renderizarSensores();
  this.reset();
  mostrarMensaje(error, "Sensor válido registrado correctamente.", true);
});

function renderizarSensores() {
  const tabla = $("tablaSensores");
  tabla.innerHTML = "";

  if (sensores.length === 0) {
    tabla.innerHTML = '<tr><td colspan="4" class="empty">Todavía no hay sensores registrados.</td></tr>';
  } else {
    sensores.forEach((sensor, indice) => {
      const fila = document.createElement("tr");
      [sensor.codigo, sensor.tipo, sensor.lectura].forEach(valor => {
        const celda = document.createElement("td");
        celda.textContent = valor;
        fila.appendChild(celda);
      });

      const celdaAccion = document.createElement("td");
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "delete-btn";
      boton.textContent = "Eliminar";
      boton.addEventListener("click", () => eliminarSensor(indice));
      celdaAccion.appendChild(boton);
      fila.appendChild(celdaAccion);
      tabla.appendChild(fila);
    });
  }

  const total = sensores.length;
  $("contadorSensores").textContent = total + (total === 1 ? " registro" : " registros");
  $("totalSensores").textContent = total + (total === 1 ? " registro" : " sensores");
}

function eliminarSensor(indice) {
  sensores.splice(indice, 1);
  guardarDatos();
  renderizarSensores();
}

// Reloj en tiempo real
function actualizarReloj() {
  if ($("reloj")) {
    $("reloj").textContent = new Date().toLocaleTimeString("es-BO");
  }
}

actualizarReloj();
setInterval(actualizarReloj, 1000);
renderizarMantenimientos();
renderizarSensores();