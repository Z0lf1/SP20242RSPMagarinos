const apiUrl = "https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero";

let listaPersonas = [];

document.addEventListener("DOMContentLoaded", function () 
{
    mostrarlistaPersonas();
    document.getElementById("btnAgregar").addEventListener("click", () => 
    {
        agregarPersona();
        mostrarCabecera("Alta");
    });

    document.getElementById("btnCancelar").addEventListener("click", () => 
    {
        ocultarAbmForm();
    });

    document.getElementById("btnAceptar").addEventListener("click", () => 
    {
        aceptar();
    });

    document.getElementById("selectTipo").addEventListener("change", function() 
    {
        actualizarVisibilidadDeCampo(this.value);
    });
});

function mostrarlistaPersonas() 
{
    mostrarSpinner();
    const xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl, true);
    xhr.onreadystatechange = function () 
    {
        if(xhr.readyState == 4 && xhr.status == 200) 
        {   
            listaPersonas = JSON.parse(xhr.responseText);
            renderizarTabla();
            ocultarSpinner(); 
        }
    };
    xhr.send();
}

function renderizarTabla() 
{
    const tbody = document.getElementById("tablaPersonas").getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";
    listaPersonas.forEach(persona => 
    {
        console.log(persona);
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${persona.id}</td>
            <td>${persona.nombre}</td>
            <td>${persona.apellido}</td>
            <td>${persona.fechaNacimiento}</td>
            <td>${persona.dni || "N/A"}</td>
            <td>${persona.paisOrigen || "N/A"}</td>
            <td><button class="btnModify" onclick="editarPersona(${persona.id})">Modificar</button></td>         
            <td><button class="btnDelete" onclick="mostrarFormBorrar(${persona.id})">Eliminar</button></td>
            `;
        tbody.appendChild(tr);
    });
}

function agregarPersona() 
{
    limpiarAbmForm();
    Array.from(document.querySelectorAll("#formularioAbm input, #formularioAbm select")).forEach(element => 
    {
        element.readOnly = false;
        element.disabled = false;
    });
    document.getElementById("abmId").setAttribute("readonly", true);
    document.getElementById("abmId").setAttribute("disabled", true);
    document.getElementById("formularioAbm").style.display = "block";
    document.getElementById("formularioLista").style.display = "none";
    document.getElementById("btnAceptar").style.display = "inline";
    document.getElementById("btnAceptarBaja").style.display = "none";
}

function aceptar() 
{
    const nuevoPersona = obtenerFormDatos();
    if(nuevoPersona) 
    {
        if(!validarCampos(nuevoPersona)) 
        {
            return;
        }
        if(nuevoPersona.id) 
        {
            actualizarPersona(nuevoPersona);
        }
        else
        {
            guardarPersona(nuevoPersona);
        }
    }
}


async function guardarPersona(persona) 
{
    mostrarSpinner();
    try
    {
        console.log(persona);
        const respuesta = await fetch(apiUrl,
        {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify(persona)
        });

        if(respuesta.ok) 
        {
            const data = await respuesta.json();
            persona.id = data.id;
            listaPersonas.push(persona);
            renderizarTabla();
            ocultarAbmForm();
        }
        else
        {
            const mensajeError = await respuesta.text();
            throw new Error(`Error al guardar el persona: ${respuesta.status} ${mensajeError}`);
        }
    } 
    catch(error) 
    {
        console.error(error);
    }
    finally 
    {
        ocultarSpinner();
    }
}

function actualizarPersona(persona) 
{
    mostrarSpinner();
    fetch(apiUrl, 
    {
        method: "PUT",
        headers: 
        {
            "Content-Type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify(persona)
    })
    .then(respuesta => 
    {
        if(respuesta.ok) 
        {
            return respuesta.text();
        }
        else 
        {
            throw new Error(`Error al actualizar la persona: ${respuesta.status}`);
        }
    })
    .then(data => 
    {
        console.log(data);
        const indice = listaPersonas.findIndex(v => v.id.toString() == persona.id.toString());
        if(indice !== -1) 
        {
            listaPersonas[indice] = persona;
        }
        renderizarTabla();
        ocultarAbmForm();
    })
    .catch(error => 
    {
        alert(error.message);
        ocultarAbmForm();
    })
    .finally(() => 
    {
        ocultarSpinner();
    });
}


function obtenerFormDatos() 
{
    const id = document.getElementById("abmId").value;
    const nombre = document.getElementById("abmNombre").value;
    const apellido = document.getElementById("abmApellido").value;
    const fechaNacimiento = parseInt(document.getElementById("abmFechaNacimiento").value.replace(/-/g,""));
    const tipo = document.getElementById("selectTipo").value;
    let persona;

    if(tipo === "Ciudadano") 
    {
        const dni = parseInt(document.getElementById("abmDni").value);
        persona = id ? new Ciudadano(id, nombre, apellido, fechaNacimiento,dni) : new Ciudadano(null, nombre, apellido, fechaNacimiento,dni);
    } 
    else 
    {
        const paisOrigen = document.getElementById("abmPaisOrigen").value;
        persona = id ? new Extranjero(id, nombre, apellido, fechaNacimiento,paisOrigen) : new Extranjero(null, nombre, apellido, fechaNacimiento,paisOrigen);
    }

    if(!persona.id) 
    {
        delete persona.id;
    }
    return persona;
}

function mostrarSpinner() 
{
    document.getElementById("spinner").style.display = "block";
    document.getElementById("spinnerContainer").style.display = "flex";
}

function ocultarSpinner() 
{
    document.getElementById("spinner").style.display = "none";
    document.getElementById("spinnerContainer").style.display = "none";
}


function editarPersona(id) 
{
    mostrarCabecera("Modificacion");
    
    const persona = listaPersonas.find(v => v.id.toString() == id.toString());
    if(!persona)
    {
        return;
    }
    const fechaToString = persona.fechaNacimiento.toString();
    const auxFecha = fechaToString.slice(0,4) + "-" + fechaToString.slice(4,6) + "-" + fechaToString.slice(6,8);
   
    document.getElementById("abmId").value = persona.id;
    document.getElementById("abmNombre").value = persona.nombre;
    document.getElementById("abmApellido").value = persona.apellido;
    document.getElementById("abmFechaNacimiento").value = auxFecha;

    document.getElementById("btnAceptar").style.display = "inline";
    document.getElementById("btnAceptarBaja").style.display = "none";

    Array.from(document.querySelectorAll("#formularioAbm input, #formularioAbm select")).forEach(element => 
    {
        element.readOnly = false;
        element.disabled = false;
    });

    document.getElementById("selectTipo").setAttribute("readonly",true)
    document.getElementById("selectTipo").setAttribute("disabled", true);
    document.getElementById("abmId").setAttribute("readonly",true);
    document.getElementById("abmId").setAttribute("disabled",true);
    
    if(persona.dni !== undefined) 
    {
        document.getElementById("selectTipo").value = "Ciudadano";
        document.getElementById("abmDni").value = persona.dni;
        document.getElementById("Ciudadano").style.display = "block";
        document.getElementById("Extranjero").style.display = "none";
    } 
    else 
    {
        document.getElementById("selectTipo").value = "Extranjero";
        document.getElementById("abmPaisOrigen").value = persona.paisOrigen;
        document.getElementById("Ciudadano").style.display = "none";
        document.getElementById("Extranjero").style.display = "block";
    }

    document.getElementById("formularioAbm").style.display = "block";
    document.getElementById("formularioLista").style.display = "none";
}

function mostrarCabecera(mode) 
{
    document.getElementById("encabezadoAbm").innerHTML = `${mode} de persona`;
}

function ocultarAbmForm() 
{
    document.getElementById("formularioAbm").style.display = "none";
    document.getElementById("formularioLista").style.display = "block";
    document.getElementById("btnAceptar").style.display = "inline";
    document.getElementById("btnAceptarBaja").style.display = "none";
}

function limpiarAbmForm() 
{
    document.getElementById("abmId").value = "";
    document.getElementById("abmNombre").value = "";
    document.getElementById("abmApellido").value = "";
    document.getElementById("abmFechaNacimiento").value = "";
    document.getElementById("abmDni").value = "";
    document.getElementById("abmPaisOrigen").value = "";
}

function actualizarVisibilidadDeCampo(tipo) 
{
    if(tipo === "Ciudadano") 
    {
        document.getElementById("Ciudadano").style.display = "block";
        document.getElementById("Extranjero").style.display = "none";
    } 
    else if(tipo === "Extranjero")
    {
        document.getElementById("Ciudadano").style.display = "none";
        document.getElementById("Extranjero").style.display = "block";
    }
}

function borrarPersona(id) 
{
    mostrarSpinner();
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", apiUrl);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () 
    {
        if(xhr.readyState == 4) 
        {
            if(xhr.status == 200) 
            {
                listaPersonas = listaPersonas.filter(v => v.id.toString() !== id.toString());
                renderizarTabla();
                alert("Persona eliminado correctamente!");
            }
            else
            {
                alert("ERROR,no se pudo eliminar correctamente");
            }
        }
        ocultarSpinner();
        ocultarAbmForm();   
    };
    xhr.send(JSON.stringify({ id: id }));
}

function mostrarFormBorrar(id) 
{
    mostrarCabecera("Baja");
    const persona = listaPersonas.find(p => p.id.toString() == id.toString());
    if(!persona)
    {
        return;
    }
    const fechaToString = persona.fechaNacimiento.toString();
    const auxFecha = fechaToString.slice(0,4) + "-" + fechaToString.slice(4,6) + "-" + fechaToString.slice(6,8);

    document.getElementById("abmId").value = persona.id;
    document.getElementById("abmNombre").value = persona.nombre;
    document.getElementById("abmApellido").value = persona.apellido;
    document.getElementById("abmFechaNacimiento").value =auxFecha;

    Array.from(document.querySelectorAll("#formularioAbm input, #formularioAbm select")).forEach(element => 
    {
        element.readOnly = true;
        element.disabled = true;
    });

    if(persona.dni !== undefined) 
    {
        document.getElementById("selectTipo").value = "Ciudadano";
        document.getElementById("abmDni").value = persona.dni;
        document.getElementById("Ciudadano").style.display = "block";
        document.getElementById("Extranjero").style.display = "none";
    } 
    else 
    {
        document.getElementById("selectTipo").value = "Extranjero";
        document.getElementById("abmPaisOrigen").value = persona.paisOrigen;
        document.getElementById("Ciudadano").style.display = "none";
        document.getElementById("Extranjero").style.display = "block";
    }

    document.getElementById("btnAceptar").style.display = "none";
    document.getElementById("btnAceptarBaja").style.display = "inline";

    document.getElementById("formularioAbm").style.display = "block";
    document.getElementById("formularioLista").style.display = "none";

    document.getElementById("btnAceptarBaja").onclick = function() 
    {
        borrarPersona(persona.id);
    };
}

function validarCampos(persona) 
{
    if(persona.nombre !== undefined && persona.nombre !==null)
    {
        if(!persona.nombre) 
        {   
            alert("Complete el campo nombre para continuar.");
            return false;
        }
    }
    if(persona.apellido !== undefined && persona.apellido !==null)
        {
            if(!persona.apellido) 
            {   
                alert("Complete el campo apellido para continuar.");
                return false;
            }
        }

        

    if(persona.fechaNacimiento !== undefined)
    {
        if(!persona.fechaNacimiento) 
        {
            alert("Complete el campo con una fechaNacimiento mayor a 0 para continuar.");
            return false;
        }   
    }

    if(persona.paisOrigen !== undefined && persona.paisOrigen !==null)
        {
            if(!persona.paisOrigen) 
            {   
                alert("Complete el campo paisOrigen para continuar.");
                return false;
            }
        }
    
    if(persona.dni !== undefined) 
    {
        if(!persona.dni || isNaN(persona.dni))  
        {   
            alert("Complete el campo DNI mayor a 0 para continuar.");
            return false;   
        }
    }


    return true;
}