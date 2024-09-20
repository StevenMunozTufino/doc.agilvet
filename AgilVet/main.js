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

// Función para generar la receta médica
function generarReceta() {
  var parametros = obtenerParametros();

  // Verificar que se haya recibido el parámetro de fecha
  if ('fecha' in parametros) {
    var fechaElement = document.getElementById("fecha-receta");
    fechaElement.textContent += parametros['fecha'];
  }

  // Verificar que se haya recibido el parámetro de nombre de la mascota
  if ('mascota' in parametros) {
    var mascotaElement = document.getElementById("nombre-mascota");
    mascotaElement.textContent += parametros['mascota'];
  }

  // Verificar si se recibió el diagnóstico
  if ('dx' in parametros) {
    var dxElement = document.getElementById("diagnostico-receta");
    dxElement.textContent += parametros['dx'];
  }

  var recetaScript = document.getElementById("receta-script");
  var receta = document.createElement("div");
  receta.className = "receta";

  // Verificar que se haya recibido el parámetro necesario
  if ('medicamento' in parametros) {
    var medicamentos = parametros['medicamento'].split(",");
    for (var i = 0; i < medicamentos.length; i++) {
      var item = document.createElement("div");
      item.className = "item";
      var medicamentoElement = document.createElement("div");
      medicamentoElement.className = "medicamento";
      medicamentoElement.textContent = medicamentos[i];
      
      item.appendChild(medicamentoElement);
      receta.appendChild(item);
    }
  } else {
    var mensajeError = document.createElement("p");
    mensajeError.textContent = "Error: No se ha proporcionado el parámetro necesario.";
    receta.appendChild(mensajeError);
  }
  
  recetaScript.appendChild(receta);
  // Imprimir la página automáticamente
  window.print();
}

// Llamar a la función cuando la página haya cargado
window.onload = generarReceta;
