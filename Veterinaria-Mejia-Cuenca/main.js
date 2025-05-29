function obtenerParametros() {
    var parametros = {};
    var query = window.location.search.substring(1);
    var pares = query.split("&");
    for (var i = 0; i < pares.length; i++) {
        var par = pares[i].split("=");
        parametros[par[0]] = decodeURIComponent(par[1] || "");
    }
    return parametros;
}

function extraerViaIndicaciones(texto) {
    // Busca "VIA:" e "INDICACIONES:" y separa en partes
    var via = "";
    var indicaciones = "";
    var resto = texto;

    var viaIdx = texto.toUpperCase().indexOf("VIA:");
    var indIdx = texto.toUpperCase().indexOf("INDICACIONES:");

    if (viaIdx !== -1) {
        resto = texto.substring(0, viaIdx).trim();
        if (indIdx !== -1) {
            via = texto.substring(viaIdx + 4, indIdx).trim();
            indicaciones = texto.substring(indIdx + 13).trim();
        } else {
            via = texto.substring(viaIdx + 4).trim();
        }
    } else if (indIdx !== -1) {
        resto = texto.substring(0, indIdx).trim();
        indicaciones = texto.substring(indIdx + 13).trim();
    }

    return {
        principal: resto,
        via: via,
        indicaciones: indicaciones
    };
}

function renderReceta() {
    var params = obtenerParametros();

    // Mapear los parámetros recibidos a los placeholders del HTML
    var map = {
        telefono_clinica: params.tel_clinica || "",
        telefono_cliente: params.tel_cliente || "",
        paciente: params.nom_mascota || "",
        edad: params.edad_mascota || "",
        especie: params.esp_mascota || "",
        fecha: params.fecha || "",
        propietario: params.nom_cliente || "",
        diagnostico: params.dx || "",
        procedimiento: params.procedimiento || "",
        control: params.control || "",
        seguimiento: params.seguimiento || "",
        veterinario: params.veterinario || "",
        direccion: params.direccion || "",
        telefono_veterinario: params.telefono_veterinario || ""
    };

    // Reemplaza los placeholders {{variable}} en el HTML
    document.body.innerHTML = document.body.innerHTML.replace(/{{(\w+)}}/g, function(match, key) {
        return map[key] || "";
    });

    // Renderiza lista de tratamientos si existen en los parámetros (en formato JSON codificado en URI)
    var ol = document.querySelector("ol");
    if (params.tratamientos) {
        try {
            var tratamientos = JSON.parse(decodeURIComponent(params.tratamientos));
            if (ol && Array.isArray(tratamientos)) {
                ol.innerHTML = "";
                tratamientos.forEach(function(t) {
                    var li = document.createElement("li");
                    li.innerHTML = "<strong>" + (t.nombre || "") + "</strong><ul>" +
                        "<li>Dosis: " + (t.dosis || "") + "</li>" +
                        "<li>Vía: " + (t.via || "") + "</li>" +
                        "<li>Duración: " + (t.duracion || "") + "</li>" +
                        "<li>Indicaciones: " + (t.indicaciones || "") + "</li></ul>";
                    ol.appendChild(li);
                });
            }
        } catch (e) {}
    } else if (params.medicamento) {
        // Si no hay tratamientos pero sí medicamento, mostrar cada medicamento como un ítem
        var medicamentos = params.medicamento.split(",");
        if (ol && medicamentos.length > 0) {
            ol.innerHTML = "";
            medicamentos.forEach(function(med) {
                var datos = extraerViaIndicaciones(med.trim());
                var li = document.createElement("li");
                li.innerHTML = datos.principal;
                if (datos.via) {
                    li.innerHTML += "<br><strong>Vía:</strong> " + datos.via;
                }
                if (datos.indicaciones) {
                    li.innerHTML += "<br><strong>Indicaciones:</strong> " + datos.indicaciones;
                }
                ol.appendChild(li);
            });
        }
    }

    // Renderiza lista de cuidados si existen en los parámetros
    var ul = document.querySelector("ul");
    if (params.cuidados) {
        // Si es un JSON válido, úsalo como array, si no, sepáralo por comas
        var cuidados = [];
        try {
            var parsed = JSON.parse(decodeURIComponent(params.cuidados));
            if (Array.isArray(parsed)) {
                cuidados = parsed;
            } else if (typeof parsed === "string") {
                cuidados = [parsed];
            }
        } catch (e) {
            // Si no es JSON, separar por coma
            cuidados = params.cuidados.split(",");
        }
        if (ul && cuidados.length > 0) {
            ul.innerHTML = "";
            cuidados.forEach(function(c) {
                var li = document.createElement("li");
                li.textContent = c.trim();
                ul.appendChild(li);
            });
        }
    }

    // Imprimir automáticamente
    window.print();
}

window.onload = renderReceta;
