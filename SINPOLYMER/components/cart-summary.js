class CartSummary extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._items = [];
  }

  connectedCallback() {
    this._render();
  }

  get _total() {
    return this._items.reduce((sum, i) => sum + i.subtotal, 0);
  }

  agregarItem(item) {
    this._items.push(item);
    this._render();
  }

  _limpiar() {
    this._items = [];
    this._render();
  }

  _render() {
    const vacio = this._items.length === 0;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .resumen { border: 1px solid #ddd; border-radius: 8px; padding: 16px; background: #fff; max-width: 380px; margin-top: 20px; }
        h3 { margin: 0 0 12px; font-size: 16px; }
        .item { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; border-bottom: 1px solid #f0f0f0; }
        .total { display: flex; justify-content: space-between; font-weight: 700; margin-top: 10px; font-size: 15px; }
        button { margin-top: 12px; padding: 7px 14px; background: #e53935; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
        p { font-size: 14px; color: #888; }
      </style>

      <div class="resumen">
        <h3>Carrito</h3>
        ${vacio
          ? '<p>No hay productos.</p>'
          : `
            ${this._items.map(i => `
              <div class="item">
                <span>${i.nombre} x${i.cantidad}</span>
                <span>$${i.subtotal}</span>
              </div>
            `).join('')}
            <div class="total"><span>Total</span><span>$${this._total}</span></div>
            <button id="btn-vaciar">Vaciar</button>
          `
        }
      </div>
    `;

    if (!vacio) {
      this.shadowRoot.getElementById('btn-vaciar').addEventListener('click', () => this._limpiar());
    }
  }
}

customElements.define('cart-summary', CartSummary);
