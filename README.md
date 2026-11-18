# SIMTELE-WEB
Integrantes del Grupo: 	
-	Cespedes Callizaya Rocio Noelia
-	Clavijo Mamani Yasmin
-	Quispe Mamani Leidy Marian
  
Enlace de la página publicada: 

Enlace del repositorio Git: https://github.com/rocionoeliaCespedesCallizaya/Proyecto-Final---Sala-de-Control.git

Fecha de entrega: 18/11/2026

Panel interactivo de monitoreo de un sistema de transporte por cable.

## Estructura
- `index.html`: estructura semántica y formularios.
- `css/estilos.css`: diseño visual adaptable.
- `js/app.js`: lógica de los cuatro módulos.

## Módulos
1. **Detención de emergencia:** calcula la distancia durante el tiempo de reacción con `d = (v / 3.6) * t`. Umbral didáctico: 50 m.
2. **Mantenimiento:** permite agregar, visualizar y eliminar componentes, horas de uso y estado.
3. **Viento y oscilación:** recibe cinco mediciones y calcula promedio, máximo y clasificación descriptiva.
4. **Sensores:** valida códigos con `/^SEN-\d{3}$/`, registra tipo y lectura y permite eliminar registros.

## Tecnologías y requisitos practicados
HTML semántico, CSS responsive, JavaScript externo, funciones, `addEventListener`, DOM, `parseFloat`, condicionales, arreglos numéricos, arreglos de objetos, `push`, `splice`, `forEach`, `for`, expresiones regulares y `localStorage`.
