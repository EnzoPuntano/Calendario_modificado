"use strict";

// ═══════════════════════════════════════════════════════
//  CALENDARIO MÁGICO — script.js
//
//  Funcionalidades:
//  1. Login con persistencia en localStorage
//  2. Saludo personalizado al recargar
//  3. Switch Modo Adulto ↔ Modo Infantil (clases CSS)
//  4. Lógica de calendario con feriados argentinos
//  5. Animaciones de mascota al navegar meses
// ═══════════════════════════════════════════════════════


// ── PERSISTENCIA — localStorage ────────────────────────────

const LS_NOMBRE = 'cal_nombre'; // Clave para el nombre del usuario
const LS_MODO   = 'cal_modo';   // Clave para el modo visual

function guardarNombre(n) { localStorage.setItem(LS_NOMBRE, n); }
function obtenerNombre()  { return localStorage.getItem(LS_NOMBRE); }
function guardarModo(m)   { localStorage.setItem(LS_MODO, m); }
function obtenerModo()    { return localStorage.getItem(LS_MODO) || 'adulto'; }


// ── LOGIN ───────────────────────────────────────────────────

const loginScreen = document.getElementById('login-screen');
const loginInput  = document.getElementById('login-input');
const loginBtn    = document.getElementById('login-btn');
const loginError  = document.getElementById('login-error');
const mainWrapper = document.getElementById('main-wrapper');
const saludoTexto = document.getElementById('saludo-texto');

/**
 * Muestra el calendario y oculta el login
 * @param {string}  nombre
 * @param {boolean} esPrimerVez
 */
function mostrarCalendario(nombre, esPrimerVez) {
    loginScreen.classList.add('oculto');

    // Saludo diferente según si es primera vez o visita recurrente
    saludoTexto.textContent = esPrimerVez
        ? `👋 ¡Hola, ${nombre}! Bienvenido/a`
        : `✨ ¡Hola de nuevo, ${nombre}!`;

    mainWrapper.classList.remove('main-oculto');
    mainWrapper.classList.add('main-visible');

    // Restaurar modo guardado sin anunciarlo
    aplicarModo(obtenerModo(), false);
}

/** Valida el input y procesa el login */
function procesarLogin() {
    const nombre = loginInput.value.trim();

    if (!nombre) {
        loginError.textContent = '⚠️ Por favor ingresá tu nombre';
        loginInput.focus(); return;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(nombre)) {
        loginError.textContent = '⚠️ Solo letras, sin números ni símbolos';
        loginInput.focus(); return;
    }

    loginError.textContent = '';
    const esPrimerVez = !obtenerNombre(); // True si no había nombre guardado
    guardarNombre(nombre);
    mostrarCalendario(nombre, esPrimerVez);
}

loginBtn.addEventListener('click', procesarLogin);
loginInput.addEventListener('keydown', e => { if (e.key === 'Enter') procesarLogin(); });

// Al cargar la página: si hay nombre guardado, saltar login
window.addEventListener('DOMContentLoaded', () => {
    const nombreGuardado = obtenerNombre();
    if (nombreGuardado) {
        mostrarCalendario(nombreGuardado, false);
    } else {
        loginInput.focus();
    }
});


// ── SWITCH DE MODO VISUAL ───────────────────────────────────

const modoSwitchBtn = document.getElementById('modo-switch-btn');
const modoIcon      = document.getElementById('modo-icon');
const modoLabel     = document.getElementById('modo-label');
let   modoActual    = 'adulto';

/**
 * Aplica el modo visual cambiando clase del body
 * @param {string}  modo    - 'adulto' | 'infantil'
 * @param {boolean} guardar - si persistir en localStorage
 */
function aplicarModo(modo, guardar = true) {
    modoActual = modo;
    if (guardar) guardarModo(modo);

    if (modo === 'infantil') {
        document.body.classList.add('modo-infantil');
        modoIcon.textContent  = '🕴️';
        modoLabel.textContent = 'MODO ADULTO';
    } else {
        document.body.classList.remove('modo-infantil');
        modoIcon.textContent  = '🧒';
        modoLabel.textContent = 'MODO INFANTIL';
    }
}

// Clic en el switch: alternar entre modos
modoSwitchBtn.addEventListener('click', () => {
    aplicarModo(modoActual === 'adulto' ? 'infantil' : 'adulto');
});


// ── Nombres de meses en español ──────────────────────────────
const MESES = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

// ── Feriados fijos argentinos ─────────────────────────────────
const FERIADOS_FIJOS = {
    "01-01": { nombre: "Año Nuevo",                                        tipo: "holiday" },
    "24-03": { nombre: "Día de la Memoria",                                tipo: "holiday" },
    "02-04": { nombre: "Veteranos de Malvinas",                            tipo: "holiday" },
    "01-05": { nombre: "Día del Trabajador",                               tipo: "holiday" },
    "25-05": { nombre: "Revolución de Mayo",                               tipo: "holiday" },
    "17-06": { nombre: "Paso a la Inmortalidad del Gral. Güemes",          tipo: "holiday" },
    "20-06": { nombre: "Paso a la Inmortalidad del Gral. Belgrano",        tipo: "holiday" },
    "09-07": { nombre: "Día de la Independencia",                          tipo: "holiday" },
    "17-08": { nombre: "Paso a la Inmortalidad del Gral. San Martín",      tipo: "holiday-movil" },
    "12-10": { nombre: "Día del Respeto a la Diversidad Cultural",         tipo: "holiday-movil" },
    "20-11": { nombre: "Día de la Soberanía Nacional",                     tipo: "holiday-movil" },
    "08-12": { nombre: "Inmaculada Concepción de María",                   tipo: "holiday" },
    "25-12": { nombre: "Navidad",                                          tipo: "holiday" },
};

/**
 * Calcula feriados variables (Carnaval y Semana Santa)
 * basados en el algoritmo de la fecha de Pascua
 * @param {number} anio
 */
function getFeriadosVariables(anio) {
    // Algoritmo de Butcher para calcular Pascua
    const a = anio % 19;
    const b = Math.floor(anio / 100);
    const c = anio % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31); // 1-based
    const dia = ((h + l - 7 * m + 114) % 31) + 1;

    const pascua = new Date(anio, mes - 1, dia);

    // Helper: obtener clave "DD-MM" con offset de días desde Pascua
    const offset = (days) => {
        const d = new Date(pascua);
        d.setDate(d.getDate() + days);
        return formatKey(d.getDate(), d.getMonth() + 1);
    };

    const variables = {};
    variables[offset(-48)] = { nombre: "Carnaval",      tipo: "holiday" };
    variables[offset(-47)] = { nombre: "Carnaval",      tipo: "holiday" };
    variables[offset(-2)]  = { nombre: "Viernes Santo", tipo: "holiday" };

    return variables;
}

// ── Helpers ───────────────────────────────────────────────────

/** Formatea día y mes como "DD-MM" con cero a la izquierda */
function formatKey(dia, mes) {
    return `${String(dia).padStart(2, "0")}-${String(mes).padStart(2, "0")}`;
}

/** Verifica si un año es bisiesto */
function esBisiesto(anio) {
    return (anio % 4 === 0 && anio % 100 !== 0) || (anio % 400 === 0);
}

/** Retorna la cantidad de días en un mes (mes: 0-based) */
function diasEnMes(mes, anio) {
    const dias = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (mes === 1 && esBisiesto(anio)) return 29;
    return dias[mes];
}

/**
 * Retorna el día de la semana del primer día del mes (lunes=0)
 * @param {number} mes  - 0-based
 * @param {number} anio
 */
function primerDiaSemana(mes, anio) {
    const jsDay = new Date(anio, mes, 1).getDay(); // 0=Dom
    return (jsDay + 6) % 7; // Convertir a lunes=0
}


// ── Estado de navegación ──────────────────────────────────────
const hoy = new Date();
let viewYear  = hoy.getFullYear();
let viewMonth = hoy.getMonth(); // 0-based


// ── MÓDULO DE MASCOTA ─────────────────────────────────────────

const mascotaEl      = document.getElementById('mascota');
const bocaMascota    = document.getElementById('boca-mascota');
const starsContainer = document.getElementById('stars-container');

/** Símbolos que explotan al navegar entre meses */
const starSymbols = ['⭐','✨','💫','🌟','🎉','🎊','💛'];

/**
 * Hace explotar estrellas animadas alrededor de la mascota
 * Se llama al cambiar de mes
 */
function explotarEstrellas() {
    starsContainer.innerHTML = '';

    for (let i = 0; i < 7; i++) {
        const star = document.createElement('div');
        star.className = 'star-pop';
        star.textContent = starSymbols[Math.floor(Math.random() * starSymbols.length)];

        // Posición radial alrededor del centro de la mascota
        const angle  = (i / 7) * 360 + Math.random() * 25;
        const radius = 28 + Math.random() * 22;
        const rad    = angle * Math.PI / 180;
        star.style.left           = `${45 + Math.cos(rad) * radius}px`;
        star.style.top            = `${45 + Math.sin(rad) * radius}px`;
        star.style.animationDelay = `${i * 0.07}s`;

        starsContainer.appendChild(star);
    }

    // Limpiar después de que termina la animación
    setTimeout(() => { starsContainer.innerHTML = ''; }, 900);
}

/**
 * Activa la animación de rebote en la mascota
 * y dispara las estrellas
 */
function animarMascota() {
    mascotaEl.classList.remove('bounce');
    void mascotaEl.offsetWidth; // Forzar reflow para reiniciar animación
    mascotaEl.classList.add('bounce');
    explotarEstrellas();

    // Volver a la animación de flotado después del rebote
    setTimeout(() => { mascotaEl.classList.remove('bounce'); }, 700);
}


// ── Render del calendario ─────────────────────────────────────

/**
 * Actualiza el encabezado y anima la grilla
 * @param {string|null} direction - 'prev' | 'next' | null
 */
function renderCalendar(direction = null) {
    const grid    = document.getElementById("calendar-grid");
    const monthEl = document.getElementById("month");
    const yearEl  = document.getElementById("year");
    const tooltip = document.getElementById("tooltip");

    // Actualizar encabezado
    monthEl.textContent = MESES[viewMonth];
    yearEl.textContent  = viewYear;

    if (direction) {
        // Animar salida, luego construir y animar entrada
        grid.classList.add("slide-out");
        animarMascota(); // ← Mascota rebota al cambiar mes
        setTimeout(() => buildGrid(grid, tooltip, direction), 200);
    } else {
        buildGrid(grid, tooltip, null);
    }
}

/**
 * Construye las celdas del calendario en el DOM
 * @param {HTMLElement} grid
 * @param {HTMLElement} tooltip
 * @param {string|null} direction
 */
function buildGrid(grid, tooltip, direction) {
    grid.classList.remove("slide-out");
    grid.innerHTML = "";

    const feriadosVariables = getFeriadosVariables(viewYear);
    const totalDias  = diasEnMes(viewMonth, viewYear);
    const offsetDias = primerDiaSemana(viewMonth, viewYear);

    // Celdas vacías al inicio del mes
    for (let i = 0; i < offsetDias; i++) {
        const empty = document.createElement("div");
        empty.className = "day-cell day-cell--empty";
        grid.appendChild(empty);
    }

    // Celdas de días
    for (let dia = 1; dia <= totalDias; dia++) {
        const key = formatKey(dia, viewMonth + 1);

        // Buscar si es feriado
        const feriado = FERIADOS_FIJOS[key] || feriadosVariables[key] || null;

        // Verificar si es hoy
        const esHoy = (
            dia       === hoy.getDate()  &&
            viewMonth === hoy.getMonth() &&
            viewYear  === hoy.getFullYear()
        );

        const cell = document.createElement("div");
        cell.classList.add("day-cell");

        // Asignar clase visual según tipo de día
        if (esHoy) {
            cell.classList.add("day-cell--today");
        } else if (feriado) {
            cell.classList.add(`day-cell--${feriado.tipo}`);
        } else {
            cell.classList.add("day-cell--normal");
        }

        // Número del día
        const numSpan = document.createElement("span");
        numSpan.textContent = dia;
        cell.appendChild(numSpan);

        // Etiqueta corta del feriado + tooltip
        if (feriado) {
            const label = document.createElement("span");
            label.className = "holiday-label";
            // Mostrar las primeras 2 palabras para que entre en la celda
            const palabras = feriado.nombre.split(" ");
            label.textContent = palabras.slice(0, 2).join(" ");
            cell.appendChild(label);

            // Tooltip con nombre completo al hacer hover
            cell.addEventListener("mouseenter", (e) => {
                tooltip.textContent = feriado.nombre;
                tooltip.classList.add("visible");
                positionTooltip(e, tooltip);
            });
            cell.addEventListener("mousemove",  (e) => positionTooltip(e, tooltip));
            cell.addEventListener("mouseleave", ()  => tooltip.classList.remove("visible"));
        }

        grid.appendChild(cell);
    }

    // Animación de entrada
    if (direction) {
        grid.classList.add("slide-in");
        setTimeout(() => grid.classList.remove("slide-in"), 300);
    }
}

/**
 * Posiciona el tooltip cerca del cursor sin salirse de la ventana
 */
function positionTooltip(e, tooltip) {
    const offset = 14;
    let x = e.clientX + offset;
    let y = e.clientY + offset;
    const tw = tooltip.offsetWidth  || 160;
    const th = tooltip.offsetHeight || 40;
    if (x + tw > window.innerWidth)  x = e.clientX - tw - offset;
    if (y + th > window.innerHeight) y = e.clientY - th - offset;
    tooltip.style.left = x + "px";
    tooltip.style.top  = y + "px";
}


// ── Navegación entre meses ────────────────────────────────────

document.getElementById("prev-month").addEventListener("click", () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar("prev");
});

document.getElementById("next-month").addEventListener("click", () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar("next");
});


// ── Iniciar ───────────────────────────────────────────────────
renderCalendar();