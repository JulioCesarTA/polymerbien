# Polymer vs Vanilla JS — Explicación del proyecto Tienda

---

## ¿Qué es Polymer?

Polymer es una librería de Google que facilita la creación de **Web Components** personalizados. Por debajo usa las mismas APIs del navegador (Shadow DOM, Custom Elements), pero agrega un sistema de **data binding**, **propiedades reactivas** y **templates declarativos** que hacen el código más corto y automático.

---

## 1. Custom Elements — El componente como etiqueta HTML

Con Polymer defines una clase que extiende `PolymerElement` y la registras con un nombre:

```js
// CONPOLYMER
class ProductCard extends PolymerElement { ... }
customElements.define('product-card', ProductCard);
```

Eso te permite usarlo en HTML como si fuera una etiqueta nativa:

```html
<product-card nombre="Camiseta" precio="25"></product-card>
```

El navegador sabe que cada vez que encuentre esa etiqueta, debe instanciar tu clase.

---

## 2. Shadow DOM — El DOM encapsulado

Cada componente tiene su propio **Shadow DOM**: un árbol DOM separado, invisible desde afuera, con su propio CSS que no se mezcla con el resto de la página.

```js
static get template() {
  return html`
    <style>
      /* Este CSS solo aplica DENTRO del componente */
      .card { border: 1px solid #ddd; }
    </style>
    <div class="card">...</div>
  `;
}
```

Ventaja clave: puedes tener `.card` en 10 componentes distintos y **nunca se pisan entre sí**.

```
document (DOM principal)
└── <product-card>
    └── #shadow-root  ← Shadow DOM del componente
        ├── <style>   ← CSS encapsulado
        └── <div class="card">
```

---

## 3. Data Binding — La magia de Polymer

El data binding es lo más poderoso de Polymer. Conecta propiedades JS con el HTML del template de forma **automática y reactiva**: cuando cambia el dato, el HTML se actualiza solo.

### Binding unidireccional `[[prop]]`

```html
<h3>[[nombre]]</h3>
<p>$[[precio]]</p>
<span>[[cantidad]]</span>
```

Cada vez que `this.nombre`, `this.precio` o `this.cantidad` cambian en JS, Polymer actualiza esos nodos del DOM automáticamente. **No necesitas tocar el DOM tú mismo.**

### Propiedades reactivas

```js
static get properties() {
  return {
    nombre:   { type: String },
    precio:   { type: Number },
    cantidad: { type: Number, value: 1, notify: true },
    subtotal: { type: Number, computed: '_calcSubtotal(precio, cantidad)' }
  };
}
```

| Opción | Qué hace |
|--------|----------|
| `type` | Convierte el atributo HTML al tipo JS correcto |
| `value` | Valor inicial de la propiedad |
| `notify: true` | Dispara automáticamente el evento `cantidad-changed` cuando cambia |
| `computed` | Recalcula la propiedad automáticamente cuando sus dependencias cambian |

### Computed properties

```js
subtotal: { type: Number, computed: '_calcSubtotal(precio, cantidad)' }

_calcSubtotal(precio, cantidad) { return precio * cantidad; }
```

`subtotal` se recalcula **solo** cada vez que `precio` o `cantidad` cambian. Y como está en el template con `[[subtotal]]`, el DOM también se actualiza solo.

---

## 4. `dom-if` y `dom-repeat` — Templates condicionales y listas

Polymer incluye elementos especiales para renderizar lógica en el template:

### `dom-if` — Renderizado condicional

```html
<template is="dom-if" if="[[imagen]]">
  <img src="[[imagen]]" alt="[[nombre]]">
</template>
<template is="dom-if" if="[[!imagen]]">
  <span>Sin imagen</span>
</template>
```

Si `imagen` tiene valor, muestra la imagen. Si no, muestra el texto. Todo declarativo, sin tocar el DOM.

### `dom-repeat` — Listas reactivas

```html
<template is="dom-repeat" items="[[items]]">
  <div class="item">
    <span>[[item.nombre]] x[[item.cantidad]]</span>
    <span>$[[item.subtotal]]</span>
  </div>
</template>
```

Genera un `<div>` por cada elemento del array `items`. Si el array cambia (con `this.push()`), el DOM se actualiza automáticamente agregando o quitando nodos.

---

## 5. Eventos y `notify`

### Disparar un evento personalizado

```js
_agregar() {
  this.dispatchEvent(new CustomEvent('agregar-item', {
    detail: { nombre: this.nombre, precio: this.precio, cantidad: this.cantidad, subtotal: this.subtotal },
    bubbles: true,   // sube por el DOM
    composed: true   // cruza el Shadow DOM hacia el documento principal
  }));
}
```

`composed: true` es clave en Web Components: permite que el evento **salga del Shadow DOM** y llegue al `document` donde lo escucha el `index.html`.

### `notify: true` — Eventos de propiedad automáticos

```js
cantidad: { type: Number, value: 1, notify: true }
```

Polymer automáticamente dispara el evento `cantidad-changed` cada vez que `this.cantidad` cambia. Esto permite que un componente padre escuche cambios sin que el hijo escriba código extra.

### El flujo completo del carrito

```
[Usuario hace clic en "Agregar"]
        ↓
product-card dispara CustomEvent('agregar-item')
        ↓
El evento sube por el DOM (bubbles + composed)
        ↓
index.html lo escucha:
  document.addEventListener('agregar-item', (e) => {
    document.getElementById('carrito').agregarItem(e.detail);
  });
        ↓
cart-summary.agregarItem() recibe el objeto
        ↓
this.push('items', item)  →  dom-repeat actualiza el HTML solo
```

---

## 6. Slots — Contenido desde afuera

Los slots permiten que quien usa el componente **inyecte HTML propio** dentro de él:

```html
<!-- En index.html -->
<product-card nombre="Camiseta" precio="25">
  <img slot="imagen" src="...">   ← va al slot "imagen"
  <span>Tallas: S, M, L, XL</span>  ← va al slot por defecto
</product-card>
```

```html
<!-- En el template del componente -->
<div class="img-wrap">
  <slot name="imagen">...</slot>  ← recibe el <img>
</div>
<div class="extra">
  <slot></slot>  ← recibe el <span>
</div>
```

El contenido del slot **vive en el DOM principal** pero se muestra dentro del Shadow DOM. Polymer agrega `::slotted()` para poder darle estilos desde dentro del componente.

---

## 7. Polymer vs Vanilla JS — Comparativa directa

### Propiedades reactivas

```js
// CONPOLYMER — automático
_mas() { this.cantidad++; }
// El HTML [[cantidad]] y [[subtotal]] se actualizan solos
```

```js
// SINPOLYMER — manual
_mas() {
  this._cantidad++;
  this.shadowRoot.getElementById('cantidad').textContent = this._cantidad;
  this.shadowRoot.getElementById('subtotal').textContent = this.subtotal;
}
```

### Renderizado de listas

```html
<!-- CONPOLYMER — declarativo -->
<template is="dom-repeat" items="[[items]]">
  <div class="item">[[item.nombre]]</div>
</template>
```

```js
// SINPOLYMER — imperativo
this.shadowRoot.innerHTML = `
  ${this._items.map(i => `<div class="item">${i.nombre}</div>`).join('')}
`;
```

### Condicionales

```html
<!-- CONPOLYMER -->
<template is="dom-if" if="[[_vacio(items.length)]]">
  <p>No hay productos.</p>
</template>
```

```js
// SINPOLYMER
vacio ? '<p>No hay productos.</p>' : `...lista...`
```

### Mutación de arrays

```js
// CONPOLYMER — Polymer intercepta el push y actualiza dom-repeat
this.push('items', item);

// SINPOLYMER — push normal + re-render manual completo
this._items.push(item);
this._render();
```

---

## Resumen

| Característica | Polymer | Vanilla JS |
|---|---|---|
| Data binding | Automático con `[[prop]]` | Manual, actualizas el DOM tú |
| Listas reactivas | `dom-repeat` | `.map()` + re-render |
| Condicionales | `dom-if` | Ternario en template literal |
| Propiedades | Declarativas con `properties` | Getters/setters JS |
| Computed props | `computed: 'fn(a,b)'` | Getter que calcula en el momento |
| Notify | Automático (`notify: true`) | `CustomEvent` manual |
| Shadow DOM | Gestionado por Polymer | `attachShadow()` nativo |
| Dependencias | `@polymer/polymer` (~200KB) | **Cero** |

**Polymer** reduce el código repetitivo y hace el binding declarativo, a costa de agregar una dependencia y aprender su sistema.  
**Vanilla JS** es más verboso pero no depende de nada, funciona en cualquier navegador moderno y es más fácil de entender en profundidad.
