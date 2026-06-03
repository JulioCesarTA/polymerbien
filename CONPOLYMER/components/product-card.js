import { PolymerElement, html } from '../node_modules/@polymer/polymer/polymer-element.js';

class ProductCard extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host { display: block; width: 180px; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; background: #fff; }
        .img-wrap { width: 100%; height: 140px; overflow: hidden; border-radius: 6px; margin-bottom: 10px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; }
        .img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .img-wrap span { font-size: 12px; color: #aaa; }
        ::slotted(img) { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 6px; }
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
          <slot name="imagen">
            <template is="dom-if" if="[[imagen]]">
              <img src="[[imagen]]" alt="[[nombre]]">
            </template>
            <template is="dom-if" if="[[!imagen]]">
              <span>Sin imagen</span>
            </template>
          </slot>
        </div>
        <h3>[[nombre]]</h3>
        <p>$[[precio]]</p>
        <div class="qty">
          <button on-click="_menos">−</button>
          <span>[[cantidad]]</span>
          <button on-click="_mas">+</button>
        </div>
        <p>Subtotal: $[[subtotal]]</p>
        <button class="agregar" on-click="_agregar">Agregar</button>
        <div class="extra"><slot></slot></div>
      </div>
    `;
  }

  static get properties() {
    return {
      nombre:   { type: String },
      precio:   { type: Number },
      imagen:   { type: String, value: '' },
      cantidad: { type: Number, value: 1, notify: true },
      subtotal: { type: Number, computed: '_calcSubtotal(precio, cantidad)' }
    };
  }

  _calcSubtotal(precio, cantidad) { return precio * cantidad; }
  _mas()   { this.cantidad++; }
  _menos() { if (this.cantidad > 1) this.cantidad--; }

  _agregar() {
    this.dispatchEvent(new CustomEvent('agregar-item', {
      detail: { nombre: this.nombre, precio: this.precio, cantidad: this.cantidad, subtotal: this.subtotal },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('product-card', ProductCard);
