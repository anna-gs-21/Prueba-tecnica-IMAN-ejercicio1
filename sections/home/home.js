import '../../blocks/button/button.js'; 

class HomeSection extends HTMLElement {
  async connectedCallback() {
    try {
      const response = await fetch('sections/home/home.html');
      const htmlText = await response.text();

      const cssLink = `<link rel="stylesheet" href="sections/home/home.css">`;

      this.innerHTML = cssLink + htmlText;
    } catch (error) {
      console.error("Error al cargar Home: ", error);
    }
  }
}

customElements.define('home-section', HomeSection);