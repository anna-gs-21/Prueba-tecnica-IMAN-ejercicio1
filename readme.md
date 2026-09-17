# 1. Entorno

Para desarrollar la web, he usado Visual Studio Code, y a la hora de ejecutarla, he usado la extensión "live server" que se puede instalar en el propio Visual Studio Code.

He usado la extensión Live Server porque permite lanzar la página como si estuviera en un servidor dinámicamente: cada vez que guardas un cambio, se recarga la página automáticamente.


# 2. Requisitos

Se han cumplido todos los requisitos propuestos:
* Secciones intercambiables e independientes.
* Footer y header fijos.
* Bloques reutilizables.
* Carga de recursos no repetitiva.
* Control de errores.


# 3. Desarrollo y decisiones

Antes de lanzarme a escribir código, he creado los archivos y las carpetas para tener una estructura de cómo iba a ser el proyecto. Después, cuando ya tenía más o menos claro dónde iba cada cosa y qué debía programar, empecé a picar el código poco a poco.

Primero me centré en tener la base: 
* Que el footer y el header se carguen y se muestren correctamente.
* Que las secciones se carguen e intercambien usando el menú.

Después, añadí las otras funcionalidades requeridas:
* Guardar el contenido de los recursos cargados para no pedirlo dos veces.
* Controlar los errores de secciones o recursos inexistentes.

El código me quedó así:

```
const cache = {};

async function loadContent(idContainer, filePath) {
  try {
    if (!cache[filePath]) {
      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      cache[filePath] = await response.text();
    }

    document.getElementById(idContainer).innerHTML = cache[filePath];
  } catch (error) {
    console.error('Error loading content:', error);
    loadContent("content", "sections/error/error.html");
  }
}

async function loadSection(value) {
  loadContent('content', `sections/${value}/${value}.html`);
}

async function initLoad(){
  await loadContent('header', 'header.html');
  await loadContent('footer', 'footer.html');
}
    
document.addEventListener('DOMContentLoaded', initLoad);

```

Pensaba que ya había terminado con el ejercicio, pero después de releer el enunciado, vi que me faltaban por implementar los bloques reusables. 

Me di cuenta de que realmente era la estructura de una página modular. Eso cambio mi visión del ejercicio e hice muchas modificaciones en el código.

Ya había trabajado con este tipo de páginas en el pasado, pero nunca había implementado una de cero, así que estuve investigando cómo se hace y su funcionamiento.

Después de varias pruebas, conseguí el resultado que tengo ahora.

La idea era hacerlo mediante componentes personalizados para que se pudieran importar en las distintas secciones. Creé un elemento de prueba de un botón.
```
class BotonPersonalizado extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const text = this.getAttribute('text') || 'Botón';

    this.shadowRoot.innerHTML = `
      <style>
        button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover {
          background-color: #0056b3;
        }
      </style>
      <button>${text}</button>
    `;
  }
}

customElements.define('boton-personalizado', BotonPersonalizado);
```

Pero me di cuenta de que con el código que tenía no era posible implementarlo. No podía añadir etiquetas "script" a las secciones para importar los bloques reutilizables, porque el innerHTML los ignora. Y tampoco es muy buena práctica.
```
  <script src="../../blocks/button/button.js"></script>
  <section class="view-home">
    <p>¡Inicio!</p>
    <boton-personalizado text="Test"></boton-personalizado>
  </section>
```

Así que hice que la propia sección fuera un elemento personalizado, como el botón, y cargar el JavaScript desde el fetch. Pero tampoco funcionaba porque el fetch sólo obtiene el texto plano, no ejecuta JavaScript.
```
async function loadSection(value) {
  loadContent('content', `sections/${value}/${value}.js`);
}
```

Cambie de prespectiva, deje los fetch a un lado y busque otra alternativa: los imports. Los imports sí ven el JavaScript y lo ejecutan.

## 3.1. Evitar la recarga de recursos

En un inicio, para no pedir dos veces el mismo recurso, creé un objeto para usarlo como diccionario. Como sólo debe guardar datos, y no modificarlos, creé una constante.

En el diccionario se guardaba la ruta del archivo como clave y el contenido del recurso como valor. De esta forma, si se quiere obtener el contenido de un recurso (valor), sólo se tendría que buscar la ruta correspondiente (clave).

El código seguía este flujo:

1. Mira si la ruta con su contenido existe en el objeto.

2. Si no existe, lo carga y lo guarda en el diccionario.

3. Añade el contenido guardado en la página principal para que se muestre.

Primero, había pensado en hacer esta funcionalidad con una array. Pero descarté la idea cuando me di cuenta de que usar un diccionario es más óptimo. El diccionario no busca una por una todas sus posiciones como la array, por lo tanto, es más rápido y se evitan bucles innecesarios.

Pero cuando implemente los bloques reusables, cambie el diccionario por un set. En el set se guarda el nombre del recurso descargado y a la hora de comprobar si ya ha sido descargado anteriormente, es incluso más rápido. 

Aunque, ahora, al usar imports, el contenido del fichero sólo se descarga una única vez y lo guarda en la caché automáticamente. Y si vuelves a hacer import de un fichero ya descargado, devuelve el contenido de la caché. Por lo tanto, será necesario forzar una recarga cuando haya secciones dinámicas que cambian durante la visita del usuario.

## 3.2. Organización de secciones

Para que cada sección pueda tener sus propios estilos y scripts, he creado una estructura de carpetas donde:

* Cada sección tiene su propia carpeta.
* Dentro de cada carpeta (sección) hay los archivos html, css y js necesarios para esa sección.

Lo mismo ocurre con los bloques reusables: una carpeta para cada uno.

## 3.3. Encapsulación

Para evitar que los estilos y el código de los componentes se pisen, he usado el Shadow DOM para encapsular el CSS de los bloques reusables, ya que pueden ser los más problematicos.

Los eventos tambien quedan encapsulados por el Shadow DOM, pero los temporizadores no. En el caso de los temporizadores, se seguirán ejecutando en segundo plano. Si no se quiere eso, se deben de eliminar cuando se sale de la sección, y eso se puede hacer facilmente gracias a la esctructura de elementos personalizados.

De la misma forma que se llama a “connectedCallback” cuando se entra en un elemento personalizado, existe la función “disconnectedCallback” que se ejecuta cuando se elimina o esconde el elemento. Se deben de eliminar o detener los temporizadores en esa función.

# 4. Reflexión

Al ir programando los bloques reusables, me di cuenta de que realmente lo que estaba programando era una página web con estructura modular. He trabajado con este tipo de estructuras en el pasado, pero no nunca las había construido desde cero. Hacer este ejercicio me ha ayudado a entender cómo funcionan y el motivo de su diseño.

Si hubiera entendido el concepto desde un inicio, habría dado menos vueltas. Pero como dice el hecho "todos los caminos llevan a Roma" y he podido aprender en el camino, que es lo importante.

De momento, dejo la web aquí, pero aún se puede mejorar. Ahora mismo hay mezclados fetch e imports. Lo ideal sería implementar un diccionario de rutas e ir cambiando la url del navegador como hacen las páginas reales, o incluso añadir plantillas.


# 5. Fuentes de información

[How do I incluude a header and footer file on every HTML page?](https://www.tutorialspoint.com/article/how-do-i-include-a-header-and-footer-file-on-every-html-page)

[Create Reusable Components (HTML/JS) without Frameworks | Website Development Tutorial](https://www.youtube.com/watch?v=_hzf527d4m4&t=30s)

[SPA (Single-page application)](https://developer.mozilla.org/en-US/docs/Glossary/SPA)

[El uso de Web Components para un desarrollo modular y reutilizable en front-end](https://www.obsbusiness.school/blog/el-uso-de-web-components-para-un-desarrollo-modular-y-reutilizable-en-front-end-cp)

[Creando un Router con Vanilla JavaScript](https://platzi.com/blog/creando-un-router-con-vanilla-javascript/)

[JavaScript Sets](https://www.w3schools.com/js/js_sets.asp)

[Usando shadow DOM](https://developer.mozilla.org/es/docs/Web/API/Web_components/Using_shadow_DOM)

[Run Code When a Component Is Inserted or Removed from the DOM](https://developer.salesforce.com/docs/platform/lwc/guide/create-lifecycle-hooks-dom.html)



