class ProductCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._cantidad = 1;
  }

  static get observedAttributes() {
    return ['nombre', 'precio'];
  }

  get nombre()  { return this.getAttribute('nombre') || ''; }
  get precio()  { return Number(this.getAttribute('precio')) || 0; }
  get cantidad(){ return this._cantidad; }
  get subtotal(){ return this.precio * this._cantidad; }

  connectedCallback() {
    this._render();
    this._bindEvents();
  }

  attributeChangedCallback() {
    if (this.shadowRoot.innerHTML) {
      this._updateTextos();
    }
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; width: 180px; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; background: #fff; }
        .img-wrap { width: 100%; height: 140px; overflow: hidden; border-radius: 6px; margin-bottom: 10px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; }
        ::slotted(img) { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 6px; }
        .sin-imagen { font-size: 12px; color: #aaa; }
        .extra { margin-top: 8px; font-size: 13px; color: #666; }
        h3 { margin: 0 0 8px; font-size: 15px; }
        p { margin: 4px 0; font-size: 14px; color: #555; }
        .qty { display: flex; align-items: center; gap: 8px; margin: 10px 0; }
        .qty button { width: 26px; height: 26px; border: 1px solid #ccc; border-radius: 4px; background: #f5f5f5; cursor: pointer; font-size: 14px; }
        .qty span { font-weight: 600; }
        button.agregar { width: 100%; padding: 8px; background: #3949ab; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
      </style>

      <div class="card">
        <div class="img-wrap">
          <slot name="imagen"><span class="sin-imagen">Sin imagen</span></slot>
        </div>
        <h3 id="nombre">${this.nombre}</h3>
        <p id="precio">$${this.precio}</p>
        <div class="qty">
          <button id="btn-menos">−</button>
          <span id="cantidad">${this._cantidad}</span>
          <button id="btn-mas">+</button>
        </div>
        <p>Subtotal: $<span id="subtotal">${this.subtotal}</span></p>
        <button class="agregar" id="btn-agregar">Agregar</button>
        <div class="extra"><slot></slot></div>
      </div>
    `;
  }

  _bindEvents() {
    this.shadowRoot.getElementById('btn-mas').addEventListener('click', () => {
      this._cantidad++;
      this._updateCantidad();
    });

    this.shadowRoot.getElementById('btn-menos').addEventListener('click', () => {
      if (this._cantidad > 1) {
        this._cantidad--;
        this._updateCantidad();
      }
    });

    this.shadowRoot.getElementById('btn-agregar').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('agregar-item', {
        detail: { nombre: this.nombre, precio: this.precio, cantidad: this._cantidad, subtotal: this.subtotal },
        bubbles: true,
        composed: true
      }));
    });
  }

  _updateCantidad() {
    this.shadowRoot.getElementById('cantidad').textContent = this._cantidad;
    this.shadowRoot.getElementById('subtotal').textContent = this.subtotal;
  }

  _updateTextos() {
    this.shadowRoot.getElementById('nombre').textContent = this.nombre;
    this.shadowRoot.getElementById('precio').textContent = `$${this.precio}`;
    this._updateCantidad();
  }
}

customElements.define('product-card', ProductCard);
