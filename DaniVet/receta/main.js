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
  var urlEntrada = `https://script.google.com/macros/s/AKfycbz7IFcnIstPHItldH0xmvuDQfgOTZq9Kaz1c-0ZYv3_H-EhKrV_V-sHY4bFrsgO6LUlzA/exec?id_entrada=${idEntrada}`;

  var idMascota = parametros['id_mascota'];
  var urlMascota = `https://script.google.com/macros/s/AKfycbwKXXaS638tpk7DxCRzwTHtzfkTF0qxGB10yVA30KEykCfvV0N8rm5d9evLYfEPN1wu/exec?id_entrada=${idMascota}`;

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
  const contenido = document.querySelector('.receta');

  // Tamaño A5 en puntos (1 mm = 2.83465 pt)
  const a5Width = 148 * 2.83465;
  const a5Height = 210 * 2.83465;

  html2canvas(contenido, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: [a5Width, a5Height]
      });

      // Calcula el tamaño de la imagen para que encaje en A5
      const imgWidth = a5Width;
      const imgHeight = canvas.height * (a5Width / canvas.width);

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('receta.pdf');
  }).catch(error => {
      console.error("Error al capturar el contenido:", error);
  });
}

// Llamar a la función cuando la página haya cargado
window.onload = generarReceta;

// Agrega el evento al botón
document.getElementById("boton-descargar").addEventListener("click", generarPDF);
