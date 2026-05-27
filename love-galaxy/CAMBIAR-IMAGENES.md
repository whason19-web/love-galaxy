# 📸 Cómo cambiar las imágenes — Love Galaxy

## Archivo principal: `client/src/pages/Home.tsx`

---

### 🐻 Imagen del oso (portada de bienvenida)

Busca esta línea cerca del inicio del archivo:

```js
const BEARS_IMAGE_URL = "https://d2xsxph8kpxj0f.cloudfront.net/.../cute-bears-hug.webp";
```

**Opción A — Usar una URL externa:**
Reemplaza la URL por la de tu imagen (Google Drive pública, Imgur, Cloudinary, etc.):
```js
const BEARS_IMAGE_URL = "https://tu-url-de-imagen.com/foto.jpg";
```

**Opción B — Usar imagen propia en el proyecto:**
1. Copia tu imagen a `client/public/imagenes/portada.jpg`
2. Cambia la línea a:
```js
const BEARS_IMAGE_URL = "/imagenes/portada.jpg";
```

---

### 🌌 Fotos de la Galaxia (6 fotos flotantes)

Busca el array `DEFAULT_PHOTOS` (~línea 30):

```js
const DEFAULT_PHOTOS = [
  {
    id: 1,
    url: "https://images.unsplash.com/...",   // ← cambia esta URL
    title: "Manos entrelazadas",               // ← cambia el título
    quote: "Aprender cómo sos, quererte como sos." // ← cambia la frase
  },
  // ... 5 fotos más
];
```

Reemplaza cada `url`, `title` y `quote` con los tuyos.

**💡 Tip — Subir imágenes propias:**
1. Copia tus fotos a `client/public/fotos/`  
   Ejemplo: `client/public/fotos/foto1.jpg`, `foto2.jpg`, etc.
2. Usa rutas relativas:
```js
url: "/fotos/foto1.jpg",
```

---

### ✏️ Cambiar los textos / frases de amor

Busca el array `BENEDETTI_QUOTES` (~línea 12) y edita o agrega frases:

```js
const BENEDETTI_QUOTES = [
  "Tu frase personalizada aquí...",
  "Otra frase...",
  // ...
];
```

---

## 🚀 Subir a Netlify

### Método 1 — Arrastrar carpeta (más fácil)
1. Ejecuta en tu terminal: `pnpm build`
2. Se genera la carpeta `dist/public/`
3. Ve a [netlify.com/drop](https://app.netlify.com/drop)
4. Arrastra la carpeta `dist/public/` → ¡listo!

### Método 2 — Conectar GitHub (recomendado para actualizaciones)
1. Sube el proyecto a un repo en GitHub
2. En Netlify → "Add new site" → "Import from Git"
3. Conecta tu repo
4. Netlify detecta `netlify.toml` automáticamente y configura todo
5. Cada `git push` actualiza el sitio

---

## ▶️ Correr localmente

```bash
# Instalar dependencias
pnpm install

# Iniciar en modo desarrollo
pnpm dev

# Abre http://localhost:3000
```

Si no tienes pnpm: `npm install -g pnpm`
