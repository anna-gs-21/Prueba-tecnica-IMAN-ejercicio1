class Button extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    try {
      const response = await fetch('blocks/button/button.html');
      const htmlText = await response.text();

      const cssLink = `<link rel="stylesheet" href="blocks/button/button.css">`;

      this.shadowRoot.innerHTML = cssLink + htmlText;
    } catch (error) {
      console.error("Error al cargar Button: ", error);
    }
    const text = this.getAttribute('text') || 'Button';
  }
}

customElements.define('button-block', Button);