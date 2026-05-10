# SONARA v3 — Vercel + Backblaze B2

Web musical estética neón/synthwave. Sin Cloudflare, sin R2, sin D1.

## Stack
- **Hosting**: Vercel (funciones serverless Node.js)
- **Storage**: Backblaze B2 (S3-compatible)
- **Frontend**: HTML/CSS/JS puro, sin frameworks

## Variables de entorno en Vercel

Ve a tu proyecto → Settings → Environment Variables y añade:

```
B2_ENDPOINT=https://s3.us-west-000.backblazeb2.com
B2_REGION=us-west-000
B2_BUCKET=NombreDeTuBucket
B2_KEY_ID=TU_KEY_ID
B2_APPLICATION_KEY=TU_APPLICATION_KEY
ADMIN_PASSWORD=elige_una_password_segura
```

## Configuración CORS en Backblaze B2

Para que la subida directa con barra de progreso funcione, el bucket B2
necesita permitir PUT desde tu dominio Vercel.

En el dashboard de Backblaze → tu bucket → CORS Rules, añade:

```json
[
  {
    "corsRuleName": "vercel",
    "allowedOrigins": ["https://TU-APP.vercel.app"],
    "allowedOperations": ["s3_put", "s3_get", "s3_head"],
    "allowedHeaders": ["*"],
    "maxAgeSeconds": 3600
  }
]
```

## Despliegue

1. Sube el proyecto a GitHub
2. Importa en vercel.com
3. Configura las variables de entorno
4. Deploy automático

## Estructura de archivos en B2

```
sonara/
  catalog.json          ← catálogo completo (álbumes + perfil)
  profile/
    avatarKey-*.jpg
    bannerKey-*.jpg
    backgroundKey-*.jpg
  albums/
    album-xxx/
      cover.jpg
      tracks/
        001-cancion.mp3
        002-cancion.mp3
```

## Panel admin

Acceso desde botón "Admin" arriba a la derecha.

Funciones:
- Editar alias y bio
- Reemplazar avatar, banner y fondo (borra el anterior de B2)
- Subir álbum completo por carpeta
- Borrar álbumes (borra real de B2, sin archivos huérfanos)

## Comprobar variables

Visita `/api/health` para verificar que todas las variables están configuradas.
