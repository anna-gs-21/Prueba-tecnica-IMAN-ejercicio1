import '../../blocks/button/button.js'; 

class ListSection extends HTMLElement {
  async connectedCallback() {
    try {
      const response = await fetch('sections/list/list.html');
      const htmlText = await response.text();

      const cssLink = `<link rel="stylesheet" href="sections/list/list.css">`;

      this.innerHTML = cssLink + htmlText;
    } catch (error) {
      console.error("Error al cargar List: ", error);
    }
  }
}

customElements.define('list-section', ListSection);