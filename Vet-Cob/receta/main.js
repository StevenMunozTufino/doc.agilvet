// Función para obtener el parámetro id_entrada de la URL
function obtenerParametros() {
  var parametros = {};
  var query = window.location.search.substring(1);
  var pares = query.split("&");
  for (var i = 0; i < pares.length; i++) {
    var par = pares[i].split("=");
    parametros[par[0]] = decodeURIComponent(par[1]); // Decodificar el valor del parámetro
  }
  return parametros;
}

// Función para realizar la solicitud y procesar la respuesta JSON
async function generarReceta() {
  var parametros = obtenerParametros();
  
  // Verificar que se haya recibido el parámetro id_entrada
  if (!('id_entrada' in parametros)) {
    console.error("Error: No se ha proporcionado el parámetro id_entrada.");
    return;
  }

  var idEntrada = parametros['id_entrada'];
  var urlEntrada = `https://script.google.com/macros/s/AKfycbySjZHPoFXvRYfPjvfzvQEHxQAUFdvp76TWzY_rX6EAYovzjWRhYxwEx7_OeREBCHAD/exec?id_entrada=${idEntrada}`;

  // Verificar que se haya recibido el parámetro id_mascota
  if (!('id_mascota' in parametros)) {
    console.error("Error: No se ha proporcionado el parámetro id_mascota.");
    return;
  }

  var idMascota = parametros['id_mascota'];
  var urlMascota = `https://script.google.com/macros/s/AKfycbwJAHZWX8GjhgNrq5A9kQdQU7DcXmsluvvuwkEAWmjSjDbIbwfKMnAmkfqaGaJplJr8/exec?id_entrada=${idMascota}`;

  try {
    // Realizar la solicitud para obtener los datos médicos
    let responseEntrada = await fetch(urlEntrada);
    let dataEntrada = await responseEntrada.json();

    if (!dataEntrada) {
      console.error("Error: No se recibió respuesta para id_entrada.");
      return;
    }

    // Realizar la solicitud para obtener el nombre de la mascota
    let responseMascota = await fetch(urlMascota);
    let dataMascota = await responseMascota.json();

    if (!dataMascota) {
      console.error("Error: No se recibió respuesta para id_mascota.");
      return;
    }

    // Actualizar la página con los datos médicos recibidos
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
    // Verificar medicamentos
    if (dataEntrada.medicinas.length > 0) {
      dataEntrada.medicinas.forEach(m => {
      var item = document.createElement("div");
      item.className = "item";
      var medicamentoElement = document.createElement("div");
      medicamentoElement.className = "medicamento";
      medicamentoElement.textContent = `${m.medicina} (${m.medida}, Dosis: ${m.dosis}, Periodo: ${m.periodo}, Duración: ${m.duracion})`;

      item.appendChild(medicamentoElement);
      receta.appendChild(item);
      });
    } else {
      var mensajeError = document.createElement("p");
      mensajeError.textContent = "No se encontraron medicamentos.";
      receta.appendChild(mensajeError);
    }

    // Mostrar la receta
    

    recetaScript.appendChild(receta);

  } catch (error) {
    console.error("Error al realizar la solicitud:", error);
  }
}

// Llamar a la función cuando la página haya cargado
window.onload = generarReceta;
