// EcoAlimentos - Dynamic Google Sheets Live Price Sync System
const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1uep9aGKtdhokeBQhvJkBlGiF2CbCqYftQBnirM0nBmo/export?format=csv';

// Fallback PRECIOS_DB initialized with Google Sheets offline data
let PRECIOS_DB = {
  "granola crocante con miel": { c: 5650, d: 5530, e: 5460, g: 5440, i: 5370, j: 5310, k: 5150, l: 4850 },
  "granola crocante con miel sin pasas": { c: 5850, d: 5730, e: 5660, g: 5640, i: 5570, j: 5510, k: 5350, l: 5050 },
  "granola proteica": { c: 6800, d: 6680, e: 6610, g: 6590, i: 6520, j: 6460, k: 6300, l: 6000 },
  "granola con pasta de mani": { c: 6800, d: 6680, e: 6610, g: 6590, i: 6520, j: 6460, k: 6300, l: 6000 },
  "mix de frutos secos clasico": { c: 8200, d: 8080, e: 8010, g: 7990, i: 7920, j: 7860, k: 7700, l: 0 },
  "mix tropical": { c: 7950, d: 7830, e: 7760, g: 7740, i: 7670, j: 7610, k: 7450, l: 0 },
  "mix azteca": { c: 6100, d: 5980, e: 5910, g: 5890, i: 5820, j: 5760, k: 5600, l: 5300 },
  "mix de frutos secos sin pasas": { c: 15200, d: 15080, e: 15010, g: 14990, i: 14920, j: 14860, k: 14700, l: 0 },
  "barritas de frutos secos": { c: 11400, d: 11280, e: 11210, g: 11190, i: 11120, j: 11060, k: 10900, l: 0 },
  "barritas tropicales": { c: 11400, d: 11280, e: 11210, g: 11190, i: 11120, j: 11060, k: 10900, l: 0 },
  "nuez mariposa extra ligth": { c: 17300, d: 17180, e: 17110, g: 17090, i: 17020, j: 16960, k: 16800, l: 0 },
  "almendras": { c: 20300, d: 20180, e: 20110, g: 20090, i: 20020, j: 19960, k: 19800, l: 0 },
  "castanas de caju": { c: 14900, d: 14780, e: 14710, g: 14690, i: 14620, j: 14560, k: 14400, l: 0 },
  "mani sin sal": { c: 3600, d: 3480, e: 3410, g: 3390, i: 3320, j: 3260, k: 3100, l: 0 },
  "mani con sal": { c: 3600, d: 3480, e: 3410, g: 3390, i: 3320, j: 3260, k: 3100, l: 2800 },
  "mani saborizado": { c: 5000, d: 4880, e: 4810, g: 4790, i: 4720, j: 4660, k: 4500, l: 2800 },
  "mani con cascara": { c: 5000, d: 4880, e: 4810, g: 4790, i: 4720, j: 4660, k: 4500, l: 0 },
  "mani crudo": { c: 4700, d: 4580, e: 4510, g: 4490, i: 4420, j: 4360, k: 4200, l: 0 },
  "pistachos con cascara salados": { c: 34700, d: 34580, e: 34510, g: 34490, i: 34420, j: 34360, k: 34200, l: 0 },
  "avena instantanea": { c: 3000, d: 2880, e: 2810, g: 2790, i: 2720, j: 2660, k: 2500, l: 2200 },
  "avena tradicional": { c: 3000, d: 2880, e: 2810, g: 2790, i: 2720, j: 2660, k: 2500, l: 2200 },
  "almohaditas limon o frutilla": { c: 8600, d: 8480, e: 8410, g: 8390, i: 8320, j: 8260, k: 8100, l: 0 },
  "copos de maiz c azucar": { c: 3900, d: 3780, e: 3710, g: 3690, i: 3620, j: 3560, k: 3400, l: 0 },
  "copos naturales": { c: 4200, d: 4080, e: 4010, g: 3990, i: 3920, j: 3860, k: 3700, l: 0 },
  "maiz pisinallo x25kg": { c: 3800, d: 3680, e: 3610, g: 3590, i: 3520, j: 3460, k: 3300, l: 0 },
  "arroz yamani x25kg": { c: 5700, d: 5580, e: 5510, g: 5490, i: 5420, j: 5360, k: 5200, l: 0 },
  "semillas": { c: 0, d: 0, e: 0, g: 0, i: 0, j: 0, k: -500, l: 0 },
  "mix de semilllas": { c: 4300, d: 4180, e: 4110, g: 4090, i: 4020, j: 3960, k: 3800, l: 0 },
  "semillas de girasol": { c: 4300, d: 4180, e: 4110, g: 4090, i: 4020, j: 3960, k: 3800, l: 0 },
  "semillas de chia": { c: 6000, d: 5880, e: 5810, g: 5790, i: 5720, j: 5660, k: 5500, l: 0 },
  "semillas de lino": { c: 4300, d: 4180, e: 4110, g: 4090, i: 4020, j: 3960, k: 3800, l: 0 },
  "semilla de quinoa blanca": { c: 6900, d: 6780, e: 6710, g: 6690, i: 6620, j: 6560, k: 6400, l: 0 },
  "semillas de zapallo": { c: 13800, d: 13680, e: 13610, g: 13590, i: 13520, j: 13460, k: 13300, l: 0 },
  "garbanzo x25kg": { c: 3800, d: 3680, e: 3610, g: 3590, i: 3520, j: 3460, k: 3300, l: 0 },
  "lenteja x25kg": { c: 6500, d: 6380, e: 6310, g: 6290, i: 6220, j: 6160, k: 6000, l: 0 },
  "poroto alubia x25kg": { c: 4700, d: 4580, e: 4510, g: 4490, i: 4420, j: 4360, k: 4200, l: 0 },
  "soja texturizada x25kg": { c: 4200, d: 4080, e: 4010, g: 3990, i: 3920, j: 3860, k: 3700, l: 0 },
  "aceite de oliva 12l": { c: 4500, d: 4380, e: 4310, g: 4290, i: 4220, j: 4160, k: 4000, l: 3700 },
  "aceite de oliva 1l": { c: 6500, d: 6380, e: 6310, g: 6290, i: 6220, j: 6160, k: 6000, l: 5700 },
  "aceitunas verdes premium 000 12kg": { c: 7200, d: 7080, e: 7010, g: 6990, i: 6920, j: 6860, k: 6700, l: 6400 },
  "miel pura agroecologica 12kg": { c: 7000, d: 6880, e: 6810, g: 6790, i: 6720, j: 6660, k: 6500, l: 0 },
  "miel comun 12kg": { c: 3500, d: 3380, e: 3310, g: 3290, i: 3220, j: 3160, k: 3000, l: 2700 },
  "miel comun 1kg": { c: 4900, d: 4780, e: 4710, g: 4690, i: 4620, j: 4560, k: 4400, l: 4100 },
  "pasas de uva": { c: 5300, d: 5180, e: 5110, g: 5090, i: 5020, j: 4960, k: 4800, l: 4500 },
  "arandanos deshidratados": { c: 17300, d: 17180, e: 17110, g: 17090, i: 17020, j: 16960, k: 16800, l: 0 },
  "tutucas con azucar": { c: 5400, d: 5280, e: 5210, g: 5190, i: 5120, j: 5060, k: 4900, l: 0 },
  "tutucas con edulcorante": { c: 7600, d: 7480, e: 7410, g: 7390, i: 7320, j: 7260, k: 7100, l: 0 },
  "yerba tucangua": { c: 5100, d: 4980, e: 4910, g: 4890, i: 4820, j: 4760, k: 4600, l: 4300 },
  "fruta escurrida comun": { c: 5900, d: 5780, e: 5710, g: 5690, i: 5620, j: 5560, k: 5400, l: 0 },
  "fruta escurrida especial": { c: 6200, d: 6080, e: 6010, g: 5990, i: 5920, j: 5860, k: 5700, l: 0 },
  "pasta de mani x350gr": { c: 3650, d: 3530, e: 3460, g: 3440, i: 3370, j: 3310, k: 3150, l: 0 },
  "colageno en polvo x90gr": { c: 2000, d: 1880, e: 1810, g: 1790, i: 1720, j: 1660, k: 1500, l: 0 },
  "maca negra x150gr": { c: 2700, d: 2580, e: 2510, g: 2490, i: 2420, j: 2360, k: 2200, l: 0 },
  "maca blanca x500gr": { c: 3300, d: 3180, e: 3110, g: 3090, i: 3020, j: 2960, k: 2800, l: 0 },
  "ciruela sin carozo": { c: 9300, d: 9180, e: 9110, g: 9090, i: 9020, j: 8960, k: 8800, l: 0 },
  "aceite de coco x200cc": { c: 5500, d: 5380, e: 5310, g: 5290, i: 5220, j: 5160, k: 5000, l: 0 },
  "moringa x90gr": { c: 2000, d: 1880, e: 1810, g: 1790, i: 1720, j: 1660, k: 1500, l: 0 },
  "chalitas de almendras": { c: 10600, d: 10480, e: 10410, g: 10390, i: 10320, j: 10260, k: 10100, l: 0 },
  "pepas de almendras con membrillo": { c: 13000, d: 12880, e: 12810, g: 12790, i: 12720, j: 12660, k: 12500, l: 0 },
  "salsa de soja x500cc": { c: 4900, d: 4780, e: 4710, g: 4690, i: 4620, j: 4560, k: 4400, l: 0 },
  "citrato de magnesio": { c: 13800, d: 13680, e: 13610, g: 13590, i: 13520, j: 13460, k: 13300, l: 0 },
  "flor de hibiscus jamaica": { c: 20400, d: 20280, e: 20210, g: 20190, i: 20120, j: 20060, k: 19900, l: 0 },
  "stevia boliviana": { c: 8400, d: 8280, e: 8210, g: 8190, i: 8120, j: 8060, k: 7900, l: 0 },
  "gelatina sin sabor": { c: 20600, d: 20480, e: 20410, g: 20390, i: 20320, j: 20260, k: 20100, l: 0 },
  "reposteria": { c: 0, d: 0, e: 0, g: -210, i: 0, j: 0, k: 0, l: 0 },
  "coco rallado": { c: 7900, d: 7780, e: 7710, g: 7690, i: 7620, j: 7560, k: 7400, l: 0 },
  "bicarbonato de sodio": { c: 3500, d: 3380, e: 3310, g: 3290, i: 3220, j: 3160, k: 3000, l: 2700 },
  "azucar impalpable": { c: 3800, d: 3680, e: 3610, g: 3590, i: 3520, j: 3460, k: 3300, l: 0 },
  "azucar mascabo": { c: 5900, d: 5780, e: 5710, g: 5690, i: 5620, j: 5560, k: 5400, l: 0 },
  "polvo de hornear": { c: 5700, d: 5580, e: 5510, g: 5490, i: 5420, j: 5360, k: 5200, l: 0 },
  "cacao amargo": { c: 12300, d: 12180, e: 12110, g: 12090, i: 12020, j: 11960, k: 11800, l: 0 },
  "harina de arroz": { c: 2900, d: 2780, e: 2710, g: 2690, i: 2620, j: 2560, k: 2400, l: 0 },
  "fecula de mandioca": { c: 4100, d: 3980, e: 3910, g: 3890, i: 3820, j: 3760, k: 3600, l: 0 },
  "harina de almendras con piel": { c: 3800, d: 3680, e: 3610, g: 3590, i: 3520, j: 3460, k: 3300, l: 0 },
  "harina de avena": { c: 3100, d: 2980, e: 2910, g: 2890, i: 2820, j: 2760, k: 2600, l: 0 },
  "harina integral x25kg": { c: 4900, d: 4780, e: 4710, g: 4690, i: 4620, j: 4560, k: 4400, l: 0 },
  "especias y condimentos": { c: 0, d: 0, e: 0, g: -210, i: 0, j: 0, k: 0, l: 0 },
  "aji molido": { c: 5400, d: 5280, e: 5210, g: 5190, i: 5120, j: 5060, k: 4900, l: 0 },
  "ajo en polvo": { c: 6550, d: 6430, e: 6360, g: 6340, i: 6270, j: 6210, k: 6050, l: 0 },
  "ajo granulado nacional": { c: 13100, d: 12980, e: 12910, g: 12890, i: 12820, j: 12760, k: 12600, l: 0 },
  "cebolla desecada": { c: 12800, d: 12680, e: 12610, g: 12590, i: 12520, j: 12460, k: 12300, l: 0 },
  "chimichurri": { c: 6200, d: 6080, e: 6010, g: 5990, i: 5920, j: 5860, k: 5700, l: 0 },
  "comino molido": { c: 6700, d: 6580, e: 6510, g: 6490, i: 6420, j: 6360, k: 6200, l: 0 },
  "condimento para pizza": { c: 5750, d: 5630, e: 5560, g: 5540, i: 5470, j: 5410, k: 5250, l: 0 },
  "curcuma molida": { c: 6400, d: 6280, e: 6210, g: 6190, i: 6120, j: 6060, k: 5900, l: 0 },
  "curry molido": { c: 8300, d: 8180, e: 8110, g: 8090, i: 8020, j: 7960, k: 7800, l: 0 },
  "jengibre molido": { c: 12500, d: 12380, e: 12310, g: 12290, i: 12220, j: 12160, k: 12000, l: 0 },
  "laurel en hojas": { c: 14100, d: 13980, e: 13910, g: 13890, i: 13820, j: 13760, k: 13600, l: 0 },
  "nuez moscada molida": { c: 20200, d: 20080, e: 20010, g: 19990, i: 19920, j: 19860, k: 19700, l: 0 },
  "oregano": { c: 6000, d: 5880, e: 5810, g: 5790, i: 5720, j: 5660, k: 5500, l: 0 },
  "perejil": { c: 10200, d: 10080, e: 10010, g: 9990, i: 9920, j: 9860, k: 9700, l: 0 },
  "pimienta blanca molida": { c: 15300, d: 15180, e: 15110, g: 15090, i: 15020, j: 14960, k: 14800, l: 0 },
  "pimienta negra molida": { c: 14400, d: 14280, e: 14210, g: 14190, i: 14120, j: 14060, k: 13900, l: 0 },
  "pimenton dulce extra": { c: 6800, d: 6680, e: 6610, g: 6590, i: 6520, j: 6460, k: 6300, l: 0 },
  "provenzal": { c: 6600, d: 6480, e: 6410, g: 6390, i: 6320, j: 6260, k: 6100, l: 0 },
  "albahaca": { c: 10000, d: 9880, e: 9810, g: 9790, i: 9720, j: 9660, k: 9500, l: 0 },
  "canela molida": { c: 10500, d: 10380, e: 10310, g: 10290, i: 10220, j: 10160, k: 10000, l: 0 },
  "romero": { c: 9600, d: 9480, e: 9410, g: 9390, i: 9320, j: 9260, k: 9100, l: 0 },
};

// Dynamic Live Fetch from Google Sheets on Page Load
async function cargarPreciosDesdeGoogleSheets() {
  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL);
    if (!response.ok) return;
    const csvText = await response.text();
    parsearCSVyActualizarBase(csvText);
    actualizarPreciosEnPantalla();
    actualizarCarrito();
  } catch (err) {
    console.log('Utilizando base de precios fallback de Google Sheets');
  }
}

function parsearCSVyActualizarBase(csvText) {
  const lines = csvText.split('\n');
  const nuevaBase = {};
  for (let i = 2; i < lines.length; i++) {
    const cols = parsearLineaCSV(lines[i]);
    if (cols.length < 3) continue;
    const prodName = cols[0].trim();
    if (!prodName || prodName.toLowerCase() === 'productos') continue;
    const cleanKey = normalizeNameForDb(prodName);
    const parseP = (v) => parseFloat((v || '').replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '').trim()) || 0;
    const c = parseP(cols[2]);
    const d = parseP(cols[3]);
    const e = parseP(cols[4]);
    const g = parseP(cols[6]);
    const colI = parseP(cols[8]);
    const j = parseP(cols[9]);
    const k = parseP(cols[10]);
    const l = parseP(cols[11]);
    if (c === 0 && d === 0 && e === 0 && g === 0 && colI === 0 && j === 0 && k === 0 && l === 0) continue;
    nuevaBase[cleanKey] = { c, d, e, g, i: colI, j, k, l };
  }
  if (Object.keys(nuevaBase).length > 0) {
    PRECIOS_DB = nuevaBase;
  }
}

function parsearLineaCSV(line) {
  const res = [];
  let inQuotes = false;
  let sb = '';
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      res.push(sb);
      sb = '';
    } else {
      sb += char;
    }
  }
  res.push(sb);
  return res;
}

function actualizarPreciosEnPantalla() {
  const tipoCatalogo = getTipoCatalogo();
  if (!tipoCatalogo) return;
  document.querySelectorAll('.producto').forEach(div => {
    const h2 = div.querySelector('h2');
    const p = div.querySelector('p');
    if (!h2 || !p) return;
    const nombre = h2.textContent.trim();
    const dataTipo = div.dataset.tipo || 'normal';
    const precioUnitario = obtenerPrecioUnitarioCalculado({ nombre, tipo: dataTipo, precioBase: 0 }, 1, tipoCatalogo);
    if (precioUnitario > 0) {
      p.textContent = '$' + precioUnitario.toLocaleString('es-AR');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const carritoMenu = document.getElementById('carrito-menu');
  if (carritoMenu && !carritoMenu.innerHTML.trim()) {
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
        <input type="text" id="ubicacion-entrega" placeholder="Direcci\u00F3n de entrega">
        <button id="btn-enviar-whatsapp"><i class="fa-brands fa-whatsapp"></i> Enviar pedido por WhatsApp</button>
      </div>
    `;
  }
  cargarPreciosDesdeGoogleSheets();
});

// State
const carrito = [];
let yaSeMostroCarrito = false;
const numeroWhatsapp = "543517612075";

function getTipoCatalogo() {
  return document.body ? document.body.dataset.catalogo : null;
}

// Global Event Delegation for Clicks
document.addEventListener('click', (e) => {
  const target = e.target;
  const carritoMenu = document.getElementById('carrito-menu');
  const tipoCatalogo = getTipoCatalogo();

  // 1. Floating Cart Icon Click
  const iconoCarrito = target.closest('#carrito-fijo');
  if (iconoCarrito) {
    e.preventDefault();
    if (tipoCatalogo) {
      if (carritoMenu) carritoMenu.classList.toggle('oculto');
    } else {
      window.location.href = 'catalogo-personal.html';
    }
    return;
  }

  // 2. Close Cart Button Click
  const btnCerrar = target.closest('#cerrar-carrito');
  if (btnCerrar) {
    e.preventDefault();
    if (carritoMenu) carritoMenu.classList.add('oculto');
    return;
  }

  // 3. Add to Cart Button Click
  const btnAgregar = target.closest('.boton-agregar');
  if (btnAgregar) {
    e.preventDefault();
    const productoDiv = btnAgregar.closest('.producto');
    if (!productoDiv) return;

    const h2 = productoDiv.querySelector('h2');
    const pPrice = productoDiv.querySelector('p');
    if (!h2 || !pPrice) return;

    const nombre = h2.textContent.trim();
    const precioTexto = pPrice.textContent.trim();
    const cantidadInput = productoDiv.querySelector('.cantidad');
    const cantidad = cantidadInput ? (parseInt(cantidadInput.value) || 1) : 1;
    const tipoProducto = productoDiv.dataset.tipo || 'normal';
    const precioBase = parseFloat(precioTexto.replace('$','').replace(/\./g,'').replace(/,/g,'')) || 0;

    const existente = carrito.find(item => item.nombre === nombre);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      carrito.push({ nombre, precioBase, cantidad, tipo: tipoProducto });
    }

    actualizarCarrito();
    if (cantidadInput) cantidadInput.value = '1';

    if (carritoMenu) {
      carritoMenu.classList.remove('oculto');
      yaSeMostroCarrito = true;
    }
    return;
  }

  // 4. Cart Item Increase (+)
  const btnMas = target.closest('.mas');
  if (btnMas) {
    e.preventDefault();
    const index = parseInt(btnMas.dataset.index);
    if (!isNaN(index) && carrito[index]) {
      carrito[index].cantidad++;
      actualizarCarrito();
    }
    return;
  }

  // 5. Cart Item Decrease (-)
  const btnMenos = target.closest('.menos');
  if (btnMenos) {
    e.preventDefault();
    const index = parseInt(btnMenos.dataset.index);
    if (!isNaN(index) && carrito[index]) {
      if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
      } else {
        carrito.splice(index, 1);
      }
      actualizarCarrito();
    }
    return;
  }

  // 6. Send WhatsApp Order Button Click
  const btnWpp = target.closest('#btn-enviar-whatsapp');
  if (btnWpp) {
    e.preventDefault();
    enviarPedidoWhatsapp();
    return;
  }
});

function normalizeNameForDb(name) {
  if (!name) return '';
  name = name.replace(/<h3[^>]*>.*?<\/h3>/gi, '');
  name = name.toLowerCase();
  name = name.replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n');
  name = name.replace(/[^\w\s]/g, '');
  name = name.replace(/\s+/g, ' ').trim();
  return name;
}

function extractPackUnits(name) {
  if (!name) return 1;
  const m1 = name.match(/(?:pack|bulto|caja|bolsa|unidades|potes|frascos|botellas|x)\s*(?:de\s*)?(\d+)\s*(?:kg|unidades|botellas|frascos|potes|u)?/i);
  if (m1 && m1[1]) {
    const u = parseInt(m1[1]);
    if (u > 0) return u;
  }
  const m2 = name.match(/(\d+)\s*kg/i);
  if (m2 && m2[1]) {
    const u = parseInt(m2[1]);
    if (u > 0) return u;
  }
  if (/pack/i.test(name)) return 20;
  return 1;
}

function isPackProduct(name, tipo) {
  if (tipo === 'pack') return true;
  const lower = (name || '').toLowerCase();
  if (lower.includes('xpack') || lower.includes('xbulto') || lower.includes('xcaja') || lower.includes('xbolsa')) return true;
  if (lower.includes('pack de') || lower.includes('bulto de') || lower.includes('caja de') || lower.includes('bolsa de')) return true;
  if (/\b(pack|bulto|caja)\b/i.test(lower)) return true;
  return false;
}

function findDbItem(nombre) {
  const key = normalizeNameForDb(nombre);
  if (PRECIOS_DB[key]) return PRECIOS_DB[key];
  if (key.includes('pasas de uva') && PRECIOS_DB['pasas de uva']) return PRECIOS_DB['pasas de uva'];
  if ((key.includes('mix semillas') || key.includes('mix de semillas')) && PRECIOS_DB['mix de semilllas']) return PRECIOS_DB['mix de semilllas'];
  if (key.includes('quinoa blanca') && PRECIOS_DB['semilla de quinoa blanca']) return PRECIOS_DB['semilla de quinoa blanca'];
  if (key.includes('granola crocante sin pasas') && PRECIOS_DB['granola crocante con miel sin pasas']) return PRECIOS_DB['granola crocante con miel sin pasas'];
  if (key.includes('granola crocante') && !key.includes('sin pasas') && PRECIOS_DB['granola crocante con miel']) return PRECIOS_DB['granola crocante con miel'];
  if (key.includes('granola c pasta de mani') && PRECIOS_DB['granola con pasta de mani']) return PRECIOS_DB['granola con pasta de mani'];
  if (key.includes('nuez mariposa') && PRECIOS_DB['nuez mariposa extra ligth']) return PRECIOS_DB['nuez mariposa extra ligth'];
  if (key.includes('pistacho') && PRECIOS_DB['pistachos con cascara salados']) return PRECIOS_DB['pistachos con cascara salados'];
  if (key.includes('almohaditas') && PRECIOS_DB['almohaditas limon o frutilla']) return PRECIOS_DB['almohaditas limon o frutilla'];
  if (key.includes('copos de maiz naturales') && PRECIOS_DB['copos naturales']) return PRECIOS_DB['copos naturales'];
  if ((key.includes('maiz pisingallo') || key.includes('maiz pisinallo')) && PRECIOS_DB['maiz pisinallo x25kg']) return PRECIOS_DB['maiz pisinallo x25kg'];
  if (key.includes('arroz yamani') && PRECIOS_DB['arroz yamani x25kg']) return PRECIOS_DB['arroz yamani x25kg'];
  if (key.includes('garbanzo') && PRECIOS_DB['garbanzo x25kg']) return PRECIOS_DB['garbanzo x25kg'];
  if (key.includes('lenteja') && PRECIOS_DB['lenteja x25kg']) return PRECIOS_DB['lenteja x25kg'];
  if (key.includes('poroto alubia') && PRECIOS_DB['poroto alubia x25kg']) return PRECIOS_DB['poroto alubia x25kg'];
  if (key.includes('soja texturizada') && PRECIOS_DB['soja texturizada x25kg']) return PRECIOS_DB['soja texturizada x25kg'];
  if (key.includes('aceite de oliva') && (key.includes('12l') || key.includes('12 l') || key.includes('12 botellas de 12l')) && PRECIOS_DB['aceite de oliva 12l']) return PRECIOS_DB['aceite de oliva 12l'];
  if (key.includes('aceite de oliva') && (key.includes('1l') || key.includes('1 l') || key.includes('12 botellas de 1l')) && PRECIOS_DB['aceite de oliva 1l']) return PRECIOS_DB['aceite de oliva 1l'];
  if ((key.includes('miel premium') || key.includes('miel pura')) && PRECIOS_DB['miel pura agroecologica 12kg']) return PRECIOS_DB['miel pura agroecologica 12kg'];
  if (key.includes('miel') && key.includes('12kg') && PRECIOS_DB['miel comun 12kg']) return PRECIOS_DB['miel comun 12kg'];
  if (key.includes('miel') && key.includes('1kg') && PRECIOS_DB['miel comun 1kg']) return PRECIOS_DB['miel comun 1kg'];
  if (key.includes('tutucas') && key.includes('azucar') && PRECIOS_DB['tutucas con azucar']) return PRECIOS_DB['tutucas con azucar'];
  if (key.includes('tutucas') && key.includes('edulcorante') && PRECIOS_DB['tutucas con edulcorante']) return PRECIOS_DB['tutucas con edulcorante'];
  if (key.includes('pasta de mani') && PRECIOS_DB['pasta de mani x350gr']) return PRECIOS_DB['pasta de mani x350gr'];
  if (key.includes('colageno') && PRECIOS_DB['colageno en polvo x90gr']) return PRECIOS_DB['colageno en polvo x90gr'];
  if (key.includes('maca negra') && PRECIOS_DB['maca negra x150gr']) return PRECIOS_DB['maca negra x150gr'];
  if (key.includes('maca blanca') && PRECIOS_DB['maca blanca x500gr']) return PRECIOS_DB['maca blanca x500gr'];
  if (key.includes('aceite de coco') && PRECIOS_DB['aceite de coco x200cc']) return PRECIOS_DB['aceite de coco x200cc'];
  if (key.includes('moringa') && PRECIOS_DB['moringa x90gr']) return PRECIOS_DB['moringa x90gr'];
  if (key.includes('chalitas') && PRECIOS_DB['chalitas de almendras']) return PRECIOS_DB['chalitas de almendras'];
  if (key.includes('pepas') && PRECIOS_DB['pepas de almendras con membrillo']) return PRECIOS_DB['pepas de almendras con membrillo'];
  if (key.includes('salsa de soja') && PRECIOS_DB['salsa de soja x500cc']) return PRECIOS_DB['salsa de soja x500cc'];
  if (key.includes('harina integral') && PRECIOS_DB['harina integral x25kg']) return PRECIOS_DB['harina integral x25kg'];
  let bestMatch = null;
  let bestLen = 0;
  for (const k in PRECIOS_DB) {
    const item = PRECIOS_DB[k];
    if (item.c === 0 && item.d === 0 && item.e === 0 && item.g === 0 && item.i === 0 && item.j === 0 && item.k === 0 && item.l === 0) continue;
    if (key.includes(k) || k.includes(key)) {
      if (k.length > bestLen) {
        bestLen = k.length;
        bestMatch = item;
      }
    }
  }
  if (bestMatch) return bestMatch;
  console.warn('Producto sin correspondencia de precio en Google Sheets:', nombre);
  return null;
}

function obtenerPrecioUnitarioCalculado(item, totalUnidades, tipoCatalogo) {
  const isPack = isPackProduct(item.nombre, item.tipo);
  const dbItem = findDbItem(item.nombre);
  if (isPack) {
    const units = extractPackUnits(item.nombre);
    if (dbItem && dbItem.l > 0) return dbItem.l * units;
    if (dbItem && dbItem.c > 0) return dbItem.c * units;
    return item.precioBase;
  }
  if (!dbItem) return item.precioBase;
  if (tipoCatalogo === 'personal') {
    if (totalUnidades >= 12) return dbItem.e > 0 ? dbItem.e : dbItem.c;
    if (totalUnidades >= 7) return dbItem.d > 0 ? dbItem.d : dbItem.c;
    return dbItem.c;
  }
  if (tipoCatalogo === 'mayorista') {
    if (totalUnidades >= 50) return dbItem.j > 0 ? dbItem.j : dbItem.c;
    if (totalUnidades >= 30) return dbItem.i > 0 ? dbItem.i : dbItem.c;
    if (totalUnidades >= 12) return dbItem.g > 0 ? dbItem.g : dbItem.c;
    return dbItem.c; // Initial Mayorista price = Personal Col C
  }
  if (tipoCatalogo === 'distribuidor') {
    return dbItem.k > 0 ? dbItem.k : dbItem.c;
  }
  return dbItem.c;
}

function calcularTotalConDescuento() {
  const tipoCatalogo = getTipoCatalogo();
  const totalUnidades = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  return carrito.reduce((sum, item) => {
    const precioUnitario = obtenerPrecioUnitarioCalculado(item, totalUnidades, tipoCatalogo);
    return sum + (precioUnitario * item.cantidad);
  }, 0);
}

function enviarPedidoWhatsapp() {
  if (carrito.length === 0) { alert('El carrito está vacío'); return; }
  const tipoCatalogo = getTipoCatalogo();
  const totalProductos = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPacks = carrito.filter(item => isPackProduct(item.nombre, item.tipo)).reduce((sum, item) => sum + item.cantidad, 0);
  let minimoUnidades = (totalPacks > 0) ? 1 : (tipoCatalogo === 'personal' ? 5 : (tipoCatalogo === 'distribuidor' ? 20 : (tipoCatalogo === 'mayorista' ? 10 : 1)));
  if (totalProductos < minimoUnidades) { alert(`Debes agregar al menos ${minimoUnidades} unidades al carrito para poder enviar el pedido.`); return; }
  const inputUbicacion = document.getElementById('ubicacion-entrega');
  const ubicacion = inputUbicacion ? inputUbicacion.value.trim() : '';
  if (!ubicacion) { alert('Debes ingresar una ubicación válida para enviar el pedido.'); if (inputUbicacion) inputUbicacion.focus(); return; }

  // SAFETY BLOCK: Check if any item has 0, NaN, or invalid price
  let hayPrecioInvalido = false;
  carrito.forEach(item => {
    const precioUnitario = obtenerPrecioUnitarioCalculado(item, totalProductos, tipoCatalogo);
    if (isNaN(precioUnitario) || precioUnitario <= 0 || precioUnitario === null || precioUnitario === undefined) {
      hayPrecioInvalido = true;
    }
  });
  if (hayPrecioInvalido) {
    alert('No pudimos verificar el precio de uno o más productos. Por favor, intentá nuevamente o consultanos por WhatsApp.');
    return;
  }

  let mensaje = '🏷️  Solicitud de Pedido:%0A';
  const totalUnidades = totalProductos;
  carrito.forEach(item => {
    const precioUnitario = obtenerPrecioUnitarioCalculado(item, totalUnidades, tipoCatalogo);
    const precioFinal = precioUnitario * item.cantidad;
    if (item.cantidad === 1) {
      mensaje += `- ${encodeURIComponent(item.nombre)}: $${precioFinal.toLocaleString('es-AR')}`;
    } else {
      mensaje += `- ${encodeURIComponent(item.nombre)}: ${item.cantidad} unidades | ($${precioUnitario.toLocaleString('es-AR')} x ${item.cantidad}un) | $${precioFinal.toLocaleString('es-AR')}`;
    }
    mensaje += `%0A`;
  });
  const total = calcularTotalConDescuento();
  let umbral = '';
  if (tipoCatalogo === 'personal') { if (totalUnidades >= 12) umbral = 'escala 12+ unidades'; else if (totalUnidades >= 7) umbral = 'escala 7+ unidades'; }
  else if (tipoCatalogo === 'mayorista') { if (totalUnidades >= 50) umbral = 'escala 50+ unidades'; else if (totalUnidades >= 30) umbral = 'escala 30+ unidades'; else if (totalUnidades >= 12) umbral = 'escala 12+ unidades'; }
  if (umbral) { mensaje += `%0A🧾 Total: $${total.toLocaleString('es-AR')} | ${totalUnidades.toLocaleString('es-AR')}un seleccionadas | Precios actualizados por ${umbral}%0A`; }
  else { mensaje += `%0A🧾 Total: $${total.toLocaleString('es-AR')} | ${totalUnidades.toLocaleString('es-AR')}un seleccionadas %0A`; }
  mensaje += `%0A📍 Entrega en: ${encodeURIComponent(ubicacion)}%0A%0A¡Gracias!`;
  const urlWhatsapp = `https://api.whatsapp.com/send?phone=${numeroWhatsapp}&text=${mensaje}`;
  window.open(urlWhatsapp, '_blank', 'noopener');
}

function actualizarCarrito() {
  const carritoItems = document.getElementById('carrito-items');
  const totalPedidoSpan = document.getElementById('total-pedido');
  const cantidadItemsSpan = document.getElementById('cantidad-items');
  if (!carritoItems) return;
  carritoItems.innerHTML = '';
  if (carrito.length === 0) {
    carritoItems.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío.</p>';
    if (totalPedidoSpan) totalPedidoSpan.textContent = '';
    if (cantidadItemsSpan) cantidadItemsSpan.textContent = '';
    return;
  }
  const tipoCatalogo = getTipoCatalogo();
  const totalUnidades = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  carrito.forEach((item, index) => {
    const precioUnitario = obtenerPrecioUnitarioCalculado(item, totalUnidades, tipoCatalogo);
    const subtotal = precioUnitario * item.cantidad;
    const div = document.createElement('div');
    div.className = 'carrito-item';
    div.innerHTML = `
      <span class="nombre">${item.nombre}</span>
      <div class="acciones">
        <button class="menos" data-index="${index}">-</button>
        <span class="cantidad">${item.cantidad}</span>
        <button class="mas" data-index="${index}">+</button>
      </div>
      <span class="precio">$${subtotal.toLocaleString('es-AR')}</span>
    `;
    carritoItems.appendChild(div);
  });
  const total = calcularTotalConDescuento();
  if (totalPedidoSpan) totalPedidoSpan.textContent = `Total: $${total.toLocaleString('es-AR')}`;
  if (cantidadItemsSpan) cantidadItemsSpan.textContent = `${totalUnidades} un.`;
}
