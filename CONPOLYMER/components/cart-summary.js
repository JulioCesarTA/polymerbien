import { PolymerElement, html } from '../node_modules/@polymer/polymer/polymer-element.js';
import '../node_modules/@polymer/polymer/lib/elements/dom-repeat.js';
import '../node_modules/@polymer/polymer/lib/elements/dom-if.js';

class CartSummary extends PolymerElement {
  static get template() {
    return html`
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

      <template is="dom-if" if="[[_vacio(items.length)]]">
        <p>No hay productos.</p>
      </template>

      <template is="dom-repeat" items="[[items]]">
        <div class="item">
          <span>[[item.nombre]] x[[item.cantidad]]</span>
          <span>$[[item.subtotal]]</span>
        </div>
      </template>
      <template is="dom-if" if="[[!_vacio(items.length)]]">
        <div class="total"><span>Total</span><span>$[[total]]</span></div>
        <button on-click="_limpiar">Vaciar</button>
      </template>
      </div>
    `;
  }

  static get properties() {
    return {
      items: { type: Array, value: () => [], notify: true },
      total: { type: Number, computed: '_calcTotal(items.splices)' }
    };
  }

  static get observers() {
    return ['_onItemsChange(items.splices)'];
  }

  _onItemsChange() { this.notifyPath('items'); }
  _calcTotal()     { return this.items.reduce((sum, i) => sum + i.subtotal, 0); }
  _vacio(len)      { return len === 0; }

  agregarItem(item) { this.push('items', item); }
  _limpiar()        { this.set('items', []); }
}

customElements.define('cart-summary', CartSummary);
