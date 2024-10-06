// Función para obtener el parámetro id_entrada de la URL
function obtenerParametros() {
  var parametros = {};
  var query = window.location.search.substring(1);
  var pares = query.split("&");
  for (var i = 0; i < pares.length; i++) {
      var par = pares[i].split("=");
      parametros[par[0]] = decodeURIComponent(par[1]);
  }
  return parametros;
}

// Función para realizar la solicitud y procesar la respuesta JSON
async function generarReceta() {
  var parametros = obtenerParametros();
  if (!('id_entrada' in parametros) || !('id_mascota' in parametros)) {
      console.error("Error: No se han proporcionado los parámetros necesarios.");
      return;
  }

  var idEntrada = parametros['id_entrada'];
  var urlEntrada = `https://script.google.com/macros/s/AKfycbwkqLBm4M_gQ7vGA5buL5KZBsxkJ150I0KMLQSHz53pigS9oEjRdwg3toXKHvRQcNxY/exec?id_entrada=${idEntrada}`;

  var idMascota = parametros['id_mascota'];
  var urlMascota = `https://script.google.com/macros/s/AKfycbyw2kR1IOPHn-DbNLQwq-6T4AmRuXXqFmEbUYXmQGRJ2gh-BrCa--wHaxDX9ktN6nOfGQ/exec?id_entrada=${idMascota}`;

  try {
      let responseEntrada = await fetch(urlEntrada);
      let dataEntrada = await responseEntrada.json();

      let responseMascota = await fetch(urlMascota);
      let dataMascota = await responseMascota.json();

      var fechaElement = document.getElementById("fecha-receta");
      var fecha = new Date(dataEntrada.fecha);
      var options = { timeZone: 'America/Guayaquil', hour12: false };
      fechaElement.textContent += fecha.toLocaleString('es-EC', options);

      var mascotaElement = document.getElementById("nombre-mascota");
      mascotaElement.textContent += dataMascota.nombreMascota;

      var dxElement = document.getElementById("diagnostico-receta");
      if (dataEntrada.diagnosticos.length > 0) {
          dataEntrada.diagnosticos.forEach(d => {
              dxElement.textContent += d.diagnostico + " ";
          });
      } else {
          dxElement.textContent += "No se encontraron diagnósticos.";
      }

      var recetaScript = document.getElementById("receta-script");
      var receta = document.createElement("div");
      receta.className = "receta";
      if (dataEntrada.medicinas.length > 0) {
          dataEntrada.medicinas.forEach(m => {
              var item = document.createElement("div");
              item.className = "item";
              var medicamentoElement = document.createElement("div");
              medicamentoElement.className = "medicamento";
              medicamentoElement.textContent = `${m.medicina}: ${m.dosis} ${m.medida} ${m.periodo} ${m.duracion}`;
              item.appendChild(medicamentoElement);
              receta.appendChild(item);
          });
      } else {
          var mensajeError = document.createElement("p");
          mensajeError.textContent = "No se encontraron medicamentos.";
          receta.appendChild(mensajeError);
      }

      recetaScript.appendChild(receta);
      const elementosOcultos = document.querySelectorAll('.oculto');
      elementosOcultos.forEach(elemento => {
          elemento.classList.remove('oculto');
      });
      const carga = document.getElementById('carga');
      carga.classList.add('oculto');


  } catch (error) {
      console.error("Error al realizar la solicitud:", error);
  }
}

async function generarPDF() {
  const { jsPDF } = window.jspdf;

  // Captura el contenido completo del body
  const contenido = document.querySelector('.receta');

  // Usa html2canvas para capturar el contenido
  html2canvas(contenido).then(canvas => {
      const imgData = canvas.toDataURL('image/png');

      // Crear el PDF basado en el tamaño del canvas
      const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [canvas.width, canvas.height], // Establece el tamaño basado en el contenido
          putOnlyUsedFonts: true,
          floatPrecision: 16 // Precision de los float
      });

      // Agrega la imagen al PDF
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('receta.pdf'); // Guarda el PDF
  }).catch(error => {
      console.error("Error al capturar el contenido:", error);
  });
}


// Llamar a la función cuando la página haya cargado
window.onload = generarReceta;

// Agrega el evento al botón
document.getElementById("boton-descargar").addEventListener("click", generarPDF);
