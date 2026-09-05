const carritoMenu = document.getElementById("carrito-menu");
if (carritoMenu) {
  carritoMenu.innerHTML = `
    <div class="carrito-header">
      <h3>Carrito de compras</h3>
      <button id="cerrar-carrito" aria-label="Cerrar">&times;</button>
    </div>
    <div id="carrito-items"></div>
    <div class="carrito-footer">
      <div class="carrito-resumen">
        <span id="cantidad-items"></span>
        <span id="total-pedido"></span>
      </div>
      <input type="text" id="ubicacion-entrega" placeholder="📍 Dirección de entrega">
      <button id="btn-enviar-whatsapp">Enviar pedido por WhatsApp</button>
    </div>
  `;
}

const carrito = [];
let yaSeMostroCarrito = false;

const carritoItems = document.getElementById("carrito-items");
const btnCerrarCarrito = document.getElementById("cerrar-carrito");
const iconoCarrito = document.getElementById("carrito-fijo");
const tipoCatalogo = document.body.dataset.catalogo;
const inputUbicacion = document.getElementById("ubicacion-entrega");
const botonEnviarWhatsapp = document.getElementById("btn-enviar-whatsapp");
const totalPedidoSpan = document.getElementById("total-pedido");
const cantidadItemsSpan = document.getElementById("cantidad-items");
const numeroWhatsapp = "543517612075";

// Mostrar/ocultar el carrito o redirigir a catálogo
if (iconoCarrito) {
  iconoCarrito.addEventListener("click", (e) => {
    e.preventDefault();
    if (tipoCatalogo) {
      carritoMenu.classList.toggle("oculto");
    } else {
      window.location.href = "catalogo-personal.html";
    }
  });
}

if (btnCerrarCarrito) {
  btnCerrarCarrito.addEventListener("click", () => {
    carritoMenu.classList.add("oculto");
  });
}

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

// SINCRONIZACIÓN EN VIVO CON GOOGLE SHEETS
(function sincronizarPreciosGoogleSheets() {
  const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1uep9aGKtdhokeBQhvJkBlGiF2CbCqYftQBnirM0nBmo/export?format=csv";
  const tipo = document.body.dataset.catalogo;
  if (!tipo) return;

  function limpiarTexto(str) {
    if (!str) return "";
    return str.toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/c\//g, 'con')
      .replace(/premiun/g, 'premium')
      .replace(/[^a-z0-9]/g, '');
  }

  fetch(SPREADSHEET_CSV_URL)
    .then(res => {
      if (!res.ok) throw new Error("Error HTTP al descargar precios de Google Sheets");
      return res.text();
    })
    .then(csvText => {
      const lines = csvText.split(/\r?\n/);
      const priceMap = {};

      lines.forEach(line => {
        if (!line.trim() || line.includes("Productos,Precio de Costo") || line.includes(",,Consumo Personal")) return;
        
        const fields = [];
        let inQuotes = false;
        let current = "";
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            fields.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        fields.push(current.trim());

        if (fields.length > 2) {
          const rawName = fields[0].replace(/"/g, '').trim();
          const personalX1 = fields[2].replace(/"/g, '').trim();
          const mayorista12 = fields.length > 6 ? fields[6].replace(/"/g, '').trim() : "";
          const distribuidor = fields.length > 10 ? fields[10].replace(/"/g, '').trim() : "";
          const pack = fields.length > 11 ? fields[11].replace(/"/g, '').trim() : "";

          if (personalX1 && personalX1.startsWith("$")) {
            let precioFinal = personalX1;
            if (tipo === "mayorista" && mayorista12) precioFinal = mayorista12;
            if (tipo === "distribuidor") precioFinal = distribuidor || pack || personalX1;

            const key = limpiarTexto(rawName);
            if (key) priceMap[key] = precioFinal;
          }
        }
      });

      document.querySelectorAll(".producto").forEach(prod => {
        const h2 = prod.querySelector("h2");
        const pPrice = prod.querySelector("p");
        if (!h2 || !pPrice) return;

        const h2Clean = limpiarTexto(h2.textContent);
        for (const [key, val] of Object.entries(priceMap)) {
          if (h2Clean.includes(key) || key.includes(h2Clean) || (key.length > 4 && h2Clean.startsWith(key.slice(0, 6)))) {
            pPrice.textContent = val;
            break;
          }
        }
      });
    })
    .catch(err => {
      console.log("No se pudo cargar la sincronización en vivo, usando precios estáticos por defecto:", err);
    });
})();



