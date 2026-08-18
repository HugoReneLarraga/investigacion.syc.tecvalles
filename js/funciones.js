// Configuración de rutas según tus logs: carpeta "data"
const PATHS = {
    indicadores: 'config/indicadores.json',
    lineas: 'config/lineas.json',
    actualidad: 'config/actualidad.json',
    convocatorias: 'config/convocatorias.json',
    recursos: 'config/recursos.json'
};

// Función genérica para cargar JSON con la nueva ruta
async function cargarSeccion(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`404: ${url}`);
        return await response.json();
    } catch (error) {
        console.error(`Error en: ${url}`, error);
        return null;
    }
}

async function renderizarPagina() {
    // 1. Indicadores Verticales
    const indicadores = await cargarSeccion(PATHS.indicadores);
    if (indicadores) {
        const container = document.getElementById('stats-container');
        if (container) {
            container.innerHTML = "";
            const mapa = {
                sni: 'Miembros del SNI', 
                prodep: 'Perfil Deseable PRODEP', 
                cuerpos: 'Cuerpos Académicos', 
                grupos: 'Grupos de Investigación', 
                impi: 'Propiedad Intelectual (IMPI)'
            };
            
            Object.entries(mapa).forEach(([key, label]) => {
                container.innerHTML += `
                    <div class="stat-box">
                        <span class="stat-desc">${label}</span>
                        <span class="stat-num">${indicadores[key] || 0}</span>
                    </div>`;
            });
        }
    }

    // El resto de las funciones (Líneas, Actualidad, etc.) se mantienen igual...
    // Pero asegúrate de que usen las rutas de la constante PATHS.


    // 2. Líneas de Investigación (Carga desde data/lineas.json)
    const lineas = await cargarSeccion(PATHS.lineas);
    const listL = document.getElementById('lista-lineas');
    if (listL && lineas) {
        listL.innerHTML = "";
        lineas.forEach(l => listL.innerHTML += `<li>${l}</li>`);
    }

    // 3. Actualidad (Carga desde data/actualidad.json)
    const actualidad = await cargarSeccion(PATHS.actualidad);
    const containerA = document.getElementById('lista-trabajo');
    if (containerA && actualidad) {
        containerA.innerHTML = "";
        actualidad.forEach(item => {
            let claseTag = item.tipo.toLowerCase().includes('tesis') ? 'tag-tesis' : 
                           item.tipo.toLowerCase().includes('proyecto') ? 'tag-proyecto' : 'tag-pub';
            containerA.innerHTML += `
                <div style="margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:8px;">
                    <span class="tag ${claseTag}">${item.tipo}</span>
                    <strong>${item.titulo}</strong><br>
                    <small style="color: #666;">${item.autor_o_detalle}</small>
                </div>`;
        });
    }

    // 4. Convocatorias (Carga desde data/convocatorias.json)
    // ... dentro de la función renderizarPagina, en la sección de Convocatorias:
   const conv = await cargarSeccion(PATHS.convocatorias);
    const containerC = document.getElementById('lista-convocatorias');

    if (containerC && conv) {
        containerC.innerHTML = "";
        conv.forEach(c => {
            const esCerrada = c.estado && c.estado.toLowerCase() === 'cerrada';
            
            // Define el atributo download únicamente si esDescargable es true
            const atributoDownload = c.esDescargable ? `download="${c.titulo}"` : '';
            
            // Etiqueta llamativa según el estado
            const badgeHTML = esCerrada 
                ? `<span class="badge badge-cerrada">⚠️ NO VIGENTE</span>` 
                : `<span class="badge badge-abierta">VIGENTE</span>`;

            containerC.innerHTML += `
                <div class="convocatoria-item"> 
                    <a href="${c.url}" ${atributoDownload} target="_blank" class="conv-link">
                        <span class="conv-titulo">${c.titulo}</span>
                    </a>
                    ${badgeHTML}
                </div>`;
        });
    }
    // 5. Recursos (Carga desde data/recursos.json)
    // ... dentro de la sección de carga de Recursos:
    // ... dentro de la función renderizarPagina, sección Recursos:
    const recursos = await cargarSeccion(PATHS.recursos);
    const containerR = document.getElementById('lista-recursos');

    if (containerR && recursos) {
        containerR.innerHTML = `<div class="recursos-grid"></div>`;
        const grid = containerR.querySelector('.recursos-grid');

        recursos.forEach(r => {
            let contenidoExtra = "";
            let atributoDownload = r.subtipo === "descargable" ? `download="${r.titulo}"` : "";
            let textoBoton = "" //r.subtipo === "descargable" ? "📥 Descargar Recurso" : "🔗 Visitar Enlace";

            if (r.tipo === "video") {
                // Convertimos URL normal a Embed
                const videoId = r.url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|\/embed\/))([^?&"'>]+)/);
                if (videoId) {
                    const embedUrl = `https://www.youtube.com/embed/${videoId[1]}`;
                    contenidoExtra = `
                        <div class="video-responsive">
                            <iframe src="${embedUrl}" allowfullscreen></iframe>
                        </div>`;
                }
                //textoBoton = "▶️ Ver en YouTube";
            }

            grid.innerHTML += `
                <div class="recurso-item">                    
                    ${contenidoExtra}
                    <a href="${r.url}" ${atributoDownload} target="_blank" class="btn-enlace">
                        <h4>${r.titulo}</h4>
                    </a>
                </div>`;
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', renderizarPagina);