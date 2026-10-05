# Base de diseño · vipercoma

Base aprobada para Image Spacer: JavaScript y CSS locales, sin React ni proceso de compilación. `design-tokens.css` centraliza la apariencia; `ui-polish.css` la aplica.

## Paleta y formas

Fondo negro o blanco puro. Superficies grises opacas para mantener legibilidad sobre los puntos. Sin azul en los controles. Los colores del diagrama de imágenes no forman parte de esta paleta.

| Elemento | Radio |
| --- | --- |
| Campos y menús | 14 px |
| Botones y selector de distribución | 16 px |
| Indicador deslizante | 13 px |
| Opciones del menú | 9 px |
| Previsualización | 18 px |

El selector Black / White está al pie. `js/theme.js` guarda la elección en `image-spacer-theme`; sin elección previa sigue el sistema.

## Fondo reactivo

`js/dot-background.js`: canvas fijo que no intercepta clics. Separación de 20 px, radio base de 1 px, alcance del puntero de 130 px y desplazamiento máximo de 12 px. Opacidad base .23 e incremento .45. Los puntos aumentan su brillo y tamaño cerca del puntero. Se redibuja al mover el puntero, cambiar el tamaño o el tema. Densidad de píxeles limitada a 2. Movimiento reducido mantiene puntos estáticos.

## Animaciones y menús

Distribución: expansión de 150 ms, relevo a los 140 ms, llegada de 230 ms; curva `cubic-bezier(.23,1,.32,1)`. Admite arrastre y teclado. Es una adaptación independiente inspirada en RubberSegment, no una copia exacta de todas sus físicas.

Image order: opción 2 elegida, campo redondeado y chevron CSS. La lista abre con opacidad, desplazamiento de 5 px y escala vertical .96 durante 160 ms. El chevron gira. Flechas, Home y End recorren opciones; Enter o espacio seleccionan; Escape cierra. Clic fuera y salida del foco cierran. Movimiento reducido omite la animación.

## Reutilización

Cargar `design-tokens.css`, `RubberSegment.css`, `ui-polish.css` y `order-menu.css` en ese orden. Usar `data-theme="dark"` o `data-theme="light"` en body. Cargar tema antes de puntos. Los adaptadores actuales esperan selects `#mode` y `#sort` y sus etiquetas; conservan los campos ocultos para comunicar cambios al panel. No son una biblioteca genérica de componentes. Personalizar los tokens para reutilizar el lenguaje visual.

## Proceso y validación

Editar siempre este mismo directorio. Revisar PNG o animaciones antes de publicar. Los previews son simulaciones, no capturas del panel real. No crear directorios de distribución ni ZIP en cada iteración. GitHub aloja el código; no hay despliegue web configurado.

Las pruebas existentes cubren distribución y host simulado. La apariencia e interacción en Illustrator requieren revisión en la aplicación real.

## Referencias

El usuario aportó el código RubberSegment de React Bits como referencia. Verificar su licencia antes de redistribuir bajo una licencia propia. El módulo Dots de Framer enlazado no pudo consultarse; el fondo se implementó de forma original siguiendo la dirección visual solicitada.
