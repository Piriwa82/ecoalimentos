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
const numeroWhatsapp = "543517612075";
const botonEnviarWhatsapp = document.createElement("button");
botonEnviarWhatsapp.textContent = "Enviar pedido por WhatsApp";
botonEnviarWhatsapp.id = "btn-enviar-whatsapp";
carritoMenu.appendChild(botonEnviarWhatsapp);

const totalPedidoSpan = document.createElement("span");
totalPedidoSpan.id = "total-pedido";
totalPedidoSpan.style.display = "block";
totalPedidoSpan.style.marginTop = "0.3em";
totalPedidoSpan.style.fontWeight = "bold";
totalPedidoSpan.style.fontSize = "1.1em";
carritoMenu.appendChild(totalPedidoSpan);

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
    if (tipoCatalogo === "personal") minimoUnidades = 4;
    else if (tipoCatalogo === "distribuidor") minimoUnidades = 20;
    else if (tipoCatalogo === "mayorista") minimoUnidades = 8;
    else minimoUnidades = 1;
  }

  if (totalProductos < minimoUnidades) {
    alert(`Debes agregar al menos ${minimoUnidades} unidades al carrito para poder enviar el pedido.`);
    return;
  }

  const ubicacion = prompt("Por favor, ingresa tu dirección o zona de entrega:");
  if (!ubicacion || ubicacion.trim() === "") {
    alert("Debes ingresar una ubicación válida para enviar el pedido.");
    return;
  }

  let mensaje = "Hola EcoAlimentos! Quiero hacer el siguiente pedido:%0A";
  carrito.forEach(item => {
    mensaje += `- ${encodeURIComponent(item.nombre)}: ${item.cantidad} unidad(es)%0A`;
  });

  const total = calcularTotalConDescuento();
  const ahorro = calcularAhorro();
  const totalUnidades = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  mensaje += `%0A🧾 Total: $${total.toLocaleString()} | Descuento aplicado por ${totalUnidades} unidad(es)%0A`;

  mensaje += `%0A📍 Entrega en: ${encodeURIComponent(ubicacion)}%0A`;
  mensaje += `%0A¡Gracias!`;

  const urlWhatsapp = `https://api.whatsapp.com/send?phone=${numeroWhatsapp}&text=${mensaje}`;
  window.open(urlWhatsapp, "_blank");
});

// Descuentos adaptados a cada tipo de catálogo
function calcularDescuentoPorUnidad() {
  const totalUnidades = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  if (tipoCatalogo === "personal") {
    if (totalUnidades >= 10) return 140;
    if (totalUnidades >= 5) return 90;
    return 0;
  }

  if (tipoCatalogo === "distribuidor") {
    if (totalUnidades >= 20) return 250;
    return 0;
  }

  if (tipoCatalogo === "mayorista") {
    if (totalUnidades >= 50) return 460;
    if (totalUnidades >= 30) return 310;
    if (totalUnidades >= 10) return 160;
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
    if (totalUnidades >= 10) mensajeDescuento = "Descuento por 10 unidades";
    else if (totalUnidades >= 5) mensajeDescuento = "Descuento por 5 unidades";
  }

  if (tipoCatalogo === "distribuidor") {
    if (totalUnidades >= 100) mensajeDescuento = "Descuento por 100 unidades";
    else if (totalUnidades >= 50) mensajeDescuento = "Descuento por 50 unidades";
  }

  if (tipoCatalogo === "mayorista") {
    if (totalUnidades >= 10) mensajeDescuento = "Descuento por 10 unidades";
    if (totalUnidades >= 30) mensajeDescuento = "Descuento por 30 unidades";
    if (totalUnidades >= 50) mensajeDescuento = "Descuento por 50 unidades";
  }

  totalPedidoSpan.textContent = `🧾 Total: $${total.toLocaleString()} ${mensajeDescuento ? "| " + mensajeDescuento : ""}`;

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
