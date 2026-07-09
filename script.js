const carrito = [];
let yaSeMostroCarrito = false;

const carritoMenu = document.getElementById("carrito-menu");
const carritoItems = document.getElementById("carrito-items");
const btnCerrarCarrito = document.getElementById("cerrar-carrito");
const iconoCarrito = document.getElementById("carrito-fijo");
const tipoCatalogo = document.body.dataset.catalogo;

// Mostrar/ocultar el carrito
iconoCarrito.addEventListener("click", () => {
  carritoMenu.classList.toggle("oculto");
});

btnCerrarCarrito.addEventListener("click", () => {
  carritoMenu.classList.add("oculto");
});

// Agregar productos
document.querySelectorAll(".boton-agregar").forEach((boton) => {
  boton.addEventListener("click", () => {
    const productoDiv = boton.closest(".producto");
    const nombre = productoDiv.querySelector("h2").textContent.trim();
    const precioTexto = productoDiv.querySelector("p").textContent.trim();
    const cantidadInput = productoDiv.querySelector(".cantidad");
    const tipoProducto = productoDiv.dataset.tipo || "normal";

    const cantidad = parseInt(cantidadInput.value) || 1;
    const precioBase = parseFloat(precioTexto.replace("$", "").replace(/\./g, "").replace(/,/g, ""));

    const existente = carrito.find(item => item.nombre === nombre);

    if (existente) {
      existente.cantidad += cantidad;
    } else {
      carrito.push({ nombre, precioBase, cantidad, tipo: tipoProducto });
    }

    actualizarCarrito();
    cantidadInput.value = "1";

    if (!yaSeMostroCarrito) {
      carritoMenu.classList.remove("oculto");
      yaSeMostroCarrito = true;
    }
  });
});

// WhatsApp y Total/Ahorro
// URL de tu Apps Script de Google Sheets para registrar pedidos automáticamente
const googleSheetsAppURL = "https://script.google.com/macros/s/AKfycbwy3iV05OFjbxmREupimesEkXogZoUOndBP3RqEVLPb5rVgM1abEga9OD1hJMK8Sk2anw/exec";

// WhatsApp y Total/Ahorro
const numeroWhatsapp = "543517612075";
const botonEnviarWhatsapp = document.createElement("button");
botonEnviarWhatsapp.textContent = "Enviar pedido por WhatsApp";
botonEnviarWhatsapp.id = "btn-enviar-whatsapp";
carritoMenu.appendChild(botonEnviarWhatsapp);

const inputUbicacion = document.createElement("input");
inputUbicacion.type = "text";
inputUbicacion.placeholder = "📍 Direccion de entrega";
inputUbicacion.id = "ubicacion-entrega";
carritoMenu.appendChild(inputUbicacion);

// Total
const totalPedidoSpan = document.createElement("span");
totalPedidoSpan.id = "total-pedido";
totalPedidoSpan.style.display = "block";
totalPedidoSpan.style.marginTop = "0.3em";
totalPedidoSpan.style.fontWeight = "bold";
totalPedidoSpan.style.fontSize = "1.1em";
carritoMenu.appendChild(totalPedidoSpan);

const cantidadItemsSpan = document.createElement("span");
cantidadItemsSpan.id = "cantidad-items";
cantidadItemsSpan.style.display = "block";
carritoMenu.appendChild(cantidadItemsSpan);

// Enviar por WhatsApp
botonEnviarWhatsapp.addEventListener("click", () => {
  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  const totalProductos = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPacks = carrito
    .filter(item => item.tipo === "pack")
    .reduce((sum, item) => sum + item.cantidad, 0);

  let minimoUnidades;

  if (totalPacks > 0) {
    minimoUnidades = 1;
  } else {
    if (tipoCatalogo === "personal") minimoUnidades = 5;
    else if (tipoCatalogo === "distribuidor") minimoUnidades = 20;
    else if (tipoCatalogo === "mayorista") minimoUnidades = 10;
    else minimoUnidades = 1;
  }

  if (totalProductos < minimoUnidades) {
    alert(`Debes agregar al menos ${minimoUnidades} unidades al carrito para poder enviar el pedido.`);
    return;
  }

  const ubicacion = inputUbicacion.value.trim();
  if (!ubicacion) {
    alert("Debes ingresar una ubicación válida para enviar el pedido.");
    inputUbicacion.focus();
    return;
  }

  let mensaje = "🏷️  Solicitud de Pedido:%0A";
  const descuentoUnidad = calcularDescuentoPorUnidad();

  carrito.forEach(item => {
    const precioOriginalTotal = item.precioBase * item.cantidad;
    const descuentoTotal = descuentoUnidad * item.cantidad;
    const precioFinal = precioOriginalTotal - descuentoTotal;
    const precioUnitarioConDesc = item.precioBase - descuentoUnidad;

    if (item.cantidad === 1) {
      mensaje += `- ${encodeURIComponent(item.nombre)}: $${precioFinal.toLocaleString()}`;
    } else {
      mensaje += `- ${encodeURIComponent(item.nombre)}: ${item.cantidad} unidades | ($${precioUnitarioConDesc.toLocaleString()} x ${item.cantidad}un) | $${precioFinal.toLocaleString()}`;
    }

    mensaje += `%0A`;
  });

  const total = calcularTotalConDescuento();
  const totalUnidades = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  if (descuentoUnidad > 0) {
    let umbral = "";

    if (tipoCatalogo === "personal") {
      if (totalUnidades >= 12) umbral = "12 unidades";
      else if (totalUnidades >= 7) umbral = "7 unidades";
    } else if (tipoCatalogo === "distribuidor") {
      if (totalUnidades >= 20) umbral = "20 unidades";
    } else if (tipoCatalogo === "mayorista") {
      if (totalUnidades >= 50) umbral = "50 unidades";
      else if (totalUnidades >= 30) umbral = "30 unidades";
      else if (totalUnidades >= 12) umbral = "12 unidades";
    }

    mensaje += `%0A🧾 Total: $${total.toLocaleString()} | ${totalUnidades.toLocaleString()}un seleccionadas | Descuento aplicado por ${umbral}%0A`;
  } else {
    mensaje += `%0A🧾 Total: $${total.toLocaleString()} | ${totalUnidades.toLocaleString()}un seleccionadas %0A` ;
  }

  mensaje += ``;
  mensaje += `%0A📍 Entrega en: ${encodeURIComponent(ubicacion)}%0A`;
  mensaje += `%0A¡Gracias!`;

  // Enviar pedido a la planilla de Google Sheets en segundo plano (usando url-encoded para evitar problemas de CORS)
  if (googleSheetsAppURL && googleSheetsAppURL !== "URL_DE_TU_APPS_SCRIPT") {
    const formData = new URLSearchParams();
    formData.append("direccion", ubicacion);
    formData.append("cliente", "Cliente Web");
    formData.append("pedido", carrito.map(item => `${item.nombre} x${item.cantidad}`).join(", "));
    formData.append("total", total);

    fetch(googleSheetsAppURL, {
      method: "POST",
      mode: "no-cors",
      body: formData
    }).catch(err => console.error("Error al registrar el pedido:", err));
  }

  const urlWhatsapp = `https://api.whatsapp.com/send?phone=${numeroWhatsapp}&text=${mensaje}`;
  const link = document.createElement("a");
  link.href = urlWhatsapp;
  link.target = "_blank";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Descuentos por catálogo
function calcularDescuentoPorUnidad() {
  const totalUnidades = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  if (tipoCatalogo === "personal") {
    if (totalUnidades >= 12) return 190;
    if (totalUnidades >= 7) return 120;
    return 0;
  }

  if (tipoCatalogo === "mayorista") {
    if (totalUnidades >= 50) return 340;
    if (totalUnidades >= 30) return 280;
    if (totalUnidades >= 10) return 210;
    return 0;
  }

  return 0;
}


function calcularAhorro() {
  const descuentoUnidad = calcularDescuentoPorUnidad();
  return carrito.reduce((sum, item) => sum + descuentoUnidad * item.cantidad, 0);
}

function calcularTotalConDescuento() {
  const descuentoUnidad = calcularDescuentoPorUnidad();
  return carrito.reduce((sum, item) => sum + (item.precioBase - descuentoUnidad) * item.cantidad, 0);
}

// Actualizar HTML del carrito
function actualizarCarrito() {
  carritoItems.innerHTML = "";

  if (carrito.length === 0) {
    carritoItems.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío.</p>';
    totalPedidoSpan.textContent = "";
    cantidadItemsSpan.textContent = ""; 
    return;
  }

  carrito.forEach((producto, index) => {
    const item = document.createElement("div");
    item.classList.add("carrito-item");

    const precioUnitario = producto.precioBase - calcularDescuentoPorUnidad();

    item.innerHTML = `
      <span class="nombre">${producto.nombre}</span>
      <div class="acciones">
        <button class="menos" data-index="${index}">–</button>
        <span class="cantidad">${producto.cantidad}</span>
        <button class="mas" data-index="${index}">+</button>
      </div>
      <span class="precio">$${(precioUnitario * producto.cantidad).toLocaleString()}</span>
    `;

    carritoItems.appendChild(item);
  });

  const total = calcularTotalConDescuento();
  const totalUnidades = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  let mensajeDescuento = "";

  if (tipoCatalogo === "personal") {
    if (totalUnidades >= 12) mensajeDescuento = "Descuento por 12 unidades";
    else if (totalUnidades >= 7) mensajeDescuento = "Descuento por 7 unidades";
  }

  if (tipoCatalogo === "distribuidor") {
    if (totalUnidades >= 100) mensajeDescuento = "Descuento por 100 unidades";
    else if (totalUnidades >= 50) mensajeDescuento = "Descuento por 50 unidades";
  }

  if (tipoCatalogo === "mayorista") {
    if (totalUnidades >= 50) mensajeDescuento = "Descuento por 50 unidades";
    else if (totalUnidades >= 30) mensajeDescuento = "Descuento por 30 unidades";
    else if (totalUnidades >= 12) mensajeDescuento = "Descuento por 12 unidades";
  }

  totalPedidoSpan.textContent = `🧾 Total: $${total.toLocaleString()} ${mensajeDescuento ? "| " + mensajeDescuento : ""}`;
  cantidadItemsSpan.textContent = `${totalUnidades}un seleccionadas`; 

  agregarEventosBotonesCantidad();
}

// Botones + y -
function agregarEventosBotonesCantidad() {
  document.querySelectorAll(".mas").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);
      carrito[index].cantidad++;
      actualizarCarrito();
    });
  });

  document.querySelectorAll(".menos").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);
      if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
      } else {
        carrito.splice(index, 1);
      }
      actualizarCarrito();
    });
  });
}

// Actualizar precios desde la planilla de Google Sheets dinámicamente
async function actualizarPreciosDesdeSheets() {
  if (!googleSheetsAppURL || googleSheetsAppURL === "URL_DE_TU_APPS_SCRIPT") return;
  
  try {
    const response = await fetch(`${googleSheetsAppURL}?action=getPrices&_=${Date.now()}`);
    const data = await response.json();
    if (data.status === "success" && data.prices) {
      
      // Diccionario de mapeo de nombres de productos de la web a la planilla
      const nombreMapping = {
        "granola crocante (1kg)": "granola crocante con miel",
        "granola crocante (xpack de 20kg)": "granola crocante con miel",
        "granola crocante (x pack de 20kg)": "granola crocante con miel",
        "granola crocante sin pasas (1kg)": "granola crocante con miel sin pasas",
        "granola crocante sin pasas (xpack de 20kg)": "granola crocante con miel sin pasas",
        "granola crocante sin pasas (x pack de 20kg)": "granola crocante con miel sin pasas",
        "granola c/ pasta de mani (1kg)": "granola con pasta de mani",
        "mix de frutos secos clásico (1kg)": "mix de frutos secos clásico",
        "mix de frutos secos clásico (x pack de 20kg)": "mix de frutos secos clásico",
        
        "miel (xpack de 20 potes de 1/2kg)": "miel comun (1/2kg)",
        "miel (xpack de 20 frascos de 1/2kg)": "miel comun (1/2kg)",
        "miel (xpack de 10 potes de un 1kg)": "miel comun (1kg)",
        "miel (xpack de 10 frascos de 1kg)": "miel comun (1kg)",
        "miel pura agroecologica (1/2kg)": "miel pura agroecologica (1/2kg)",
        "miel comun (1/2kg)": "miel comun (1/2kg)",
        "miel comun (1kg)": "miel comun (1kg)",
        
        "aceite de oliva (xpack de 12 botellas de 1/2l)": "aceite de oliva (1/2l)",
        "aceite de oliva (xpack de 12 botellas de 1l)": "aceite de oliva [1l]",
        "aceite de oliva (1/2l)": "aceite de oliva (1/2l)",
        "aceite de oliva (1l)": "aceite de oliva [1l]",
        
        "tutucas c/azucar (x10kg fraccionadas en 2 bolsas de 5kg)": "tutucas con azucar",
        "tutucas c/azucar (x10 unidades fraccionadas en 2 bolsas de 5kg)": "tutucas con azucar",
        "tutucas c/edulcorante (x9kg fraccionadas en 3 bolsas de 3kg)": "tutucas con edulcorante",
        "tutucas c/edulcorante (x9 unidades fraccionadas en 3 bolsas de 3kg)": "tutucas con edulcorante"
      };

      document.querySelectorAll(".producto").forEach(productoDiv => {
        const nombreH2 = productoDiv.querySelector("h2");
        if (!nombreH2) return;
        
        let nombreOriginal = nombreH2.textContent.trim().toLowerCase();
        let esPack = productoDiv.dataset.tipo === "pack" || 
                     nombreOriginal.includes("pack") || 
                     nombreOriginal.includes("bulto") || 
                     nombreOriginal.includes("caja") || 
                     nombreOriginal.includes("bolsa de 10kg") || 
                     nombreOriginal.includes("bolsa de 25kg");
        
        // Buscar en mapping primero
        let nombreBuscar = nombreMapping[nombreOriginal] || nombreOriginal;
        
        // Si no está en mapping, remover sufijo de tamaño/pack para aproximar
        if (!nombreMapping[nombreOriginal]) {
          nombreBuscar = nombreBuscar
            .replace(/\(1kg\)/i, '')
            .replace(/\(x\s*pack\s*de\s*\d+kg\)/i, '')
            .replace(/\(x\s*pack\s*de\s*\d+\s*[^\)]+\)/i, '')
            .replace(/\(x\s*bulto\s*de\s*\d+kg\)/i, '')
            .replace(/\(x\s*caja\s*de\s*\d+kg\)/i, '')
            .replace(/\(bolsa\s*de\s*\d+kg\)/i, '')
            .replace(/\(bulto\s*de\s*\d+kg\)/i, '')
            .replace(/Bulto\s*de\s*\d+kg/i, '')
            .trim();
        }
        
        // Buscar el producto en la lista de precios de la planilla (comparando nombres normalizados)
        const precioItem = data.prices.find(item => {
          if (!item.productos) return false;
          let prodName = item.productos.toString().toLowerCase().trim();
          
          // Normalizar caracteres (ej: c/ -> con, quitar tildes, comillas y comparar)
          let n1 = prodName.replace(/c\//g, 'con').replace(/[^a-z0-9]/g, '');
          let n2 = nombreBuscar.replace(/c\//g, 'con').replace(/[^a-z0-9]/g, '');
          return n1 === n2 || prodName === nombreBuscar;
        });
        
        if (precioItem) {
          let nuevoPrecio = null;
          
          if (esPack) {
            // Obtener el multiplicador (ej: 20 para granola 20kg, 12 para oliva)
            let mult = obtenerMultiplicadorPack(nombreOriginal);
            
            // Priorizar columna "precio pack" de la planilla, si está vacía usar "distribuidor"
            let precioUnidadPack = precioItem["precio pack"] || precioItem["distribuidor"];
            
            if (precioUnidadPack) {
              precioUnidadPack = parseFloat(precioUnidadPack.toString().replace("$", "").replace(/\./g, "").replace(/,/g, "").trim());
            }
            
            if (precioUnidadPack && !isNaN(precioUnidadPack)) {
              nuevoPrecio = precioUnidadPack * mult;
            }
          } else {
            // Producto Unitario
            if (tipoCatalogo === "personal") {
              nuevoPrecio = precioItem["precio de venta x1un"];
            } else if (tipoCatalogo === "mayorista") {
              nuevoPrecio = precioItem["precio de venta x1un"];
            } else if (tipoCatalogo === "distribuidor") {
              nuevoPrecio = precioItem["50 prod"];
            }
            
            if (nuevoPrecio) {
              nuevoPrecio = parseFloat(nuevoPrecio.toString().replace("$", "").replace(/\./g, "").replace(/,/g, "").trim());
            }
          }
          
          if (nuevoPrecio !== null && nuevoPrecio !== undefined && nuevoPrecio !== "" && !isNaN(nuevoPrecio)) {
            const precioP = productoDiv.querySelector("p");
            if (precioP) {
              // Formatear con punto de miles
              const formattedPrice = "$" + nuevoPrecio.toLocaleString('de-DE');
              precioP.textContent = formattedPrice;
            }
          }
        }
      });
    }
  } catch (e) {
    console.error("Error al actualizar precios desde Google Sheets:", e);
  }
}

function obtenerMultiplicadorPack(nombre) {
  let match = nombre.match(/x\s*Pack\s*de\s*(\d+)/i) || 
              nombre.match(/x\s*Bulto\s*de\s*(\d+)/i) ||
              nombre.match(/x\s*Caja\s*de\s*(\d+)/i) ||
              nombre.match(/de\s*(\d+)\s*(?:kg|botellas|potes|frascos|unidades)/i) ||
              nombre.match(/bolsa\s*de\s*(\d+)/i) ||
              nombre.match(/bulto\s*de\s*(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1]);
  }
  return 1;
}

// Inicializar carga de precios al cargar la página
document.addEventListener("DOMContentLoaded", actualizarPreciosDesdeSheets);
actualizarPreciosDesdeSheets();


