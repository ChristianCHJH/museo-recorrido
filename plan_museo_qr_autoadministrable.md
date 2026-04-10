# Solicitud de proyecto  
## Plataforma web autoadministrable para recorrido de museo mediante códigos QR

## 1. Nombre tentativo del proyecto
**Experiencia digital guiada para museo mediante códigos QR**

---

## 2. Propósito general
Se requiere una solución digital para el museo que permita acompañar el recorrido físico de los visitantes mediante **códigos QR ubicados en distintas secciones**.  

Cada código QR deberá dirigir a una **página diferente**, correspondiente a una sala, pieza, etapa, colección o punto específico del recorrido. En esa página el visitante podrá visualizar contenido relacionado con la sección en la que se encuentra, como por ejemplo:

- título de la sección
- descripción histórica
- imágenes
- videos
- textos explicativos
- datos curiosos
- material complementario

La experiencia debe sentirse **cultural, elegante, intuitiva y ordenada**, con una identidad visual alineada a la estética histórica ya propuesta.

---

## 3. Objetivo del proyecto
Contar con una plataforma web que permita:

- mostrar contenido específico según el QR escaneado
- administrar fácilmente el contenido de cada sección
- mantener una experiencia visual coherente con la identidad del museo
- controlar, en la medida de lo posible, el acceso y uso del contenido durante el recorrido
- brindar una experiencia moderna pero respetuosa con el valor histórico y cultural del museo

---

## 4. Alcance funcional esperado
La solución debe contemplar dos grandes frentes:

### 4.1. Experiencia del visitante
El visitante escanea un QR y accede a una página asociada a una sección puntual del recorrido. Esa página debe mostrar contenido claro, atractivo y fácil de consumir desde celular.

### 4.2. Gestión del contenido
El museo debe poder administrar las páginas de forma interna, sin depender de cambios manuales complejos. El personal autorizado debe poder actualizar el contenido cuando sea necesario.

---

## 5. Experiencia esperada para el visitante
Cuando el visitante escanee un QR, el sistema debe permitirle:

- ingresar directamente a la página de la sección correspondiente
- identificar claramente en qué parte del recorrido se encuentra
- ver imágenes y videos relacionados con esa sección
- leer información histórica o contextual
- entender la importancia de la pieza, sala o etapa mostrada
- navegar de forma simple y cómoda desde el celular

La página debe priorizar una experiencia **mobile-first**, porque la interacción principal será desde dispositivos móviles dentro del museo.

---

## 6. Estructura esperada de cada página de sección
Cada página asociada a un QR debe seguir una estructura consistente para mantener uniformidad en todo el recorrido.

### 6.1. Encabezado
Debe incluir:

- nombre del museo
- nombre de la sección, sala o pieza
- identidad visual coherente con el museo

### 6.2. Bloque principal
Debe mostrar:

- imagen destacada o visual principal
- título de la sección
- breve introducción o resumen

### 6.3. Contenido informativo
Debe permitir incluir:

- texto descriptivo
- historia o contexto
- fechas o periodos relevantes
- personajes o elementos relacionados
- datos importantes o curiosidades

### 6.4. Contenido multimedia
Debe poder incluir:

- una o varias imágenes
- uno o varios videos
- textos cortos de apoyo o descripciones

### 6.5. Navegación simple
Debe permitir acciones como:

- continuar al siguiente punto del recorrido
- volver al inicio del recorrido digital
- regresar a la sección anterior, si aplica
- acceder a información complementaria, si aplica

---

## 7. Requerimiento clave: contenido autoadministrable
Este proyecto **debe ser autoadministrable**.

Eso significa que el usuario administrador del museo debe poder gestionar el contenido sin depender de desarrollos continuos para tareas básicas.

### 7.1. El administrador debe poder:
- crear nuevas secciones
- editar secciones existentes
- cambiar el título de una sección
- actualizar textos
- cargar o reemplazar imágenes
- cargar o reemplazar videos
- activar o desactivar una sección
- ordenar el recorrido si se requiere
- decidir qué contenido aparece en cada QR

### 7.2. El administrador también debe poder:
- relacionar un QR con una página específica
- actualizar el contenido sin alterar toda la estructura visual
- mantener la misma plantilla para varias secciones
- reutilizar la estructura para futuras exposiciones o cambios del museo

### 7.3. Beneficio esperado
Con esta autoadministración, el museo podrá:

- renovar contenido fácilmente
- adaptar recorridos temporales o permanentes
- publicar nuevas exposiciones con más rapidez
- corregir textos o reemplazar material visual sin rehacer toda la página

---

## 8. Requerimientos de diseño e identidad visual
La solución debe conservar una estética alineada a lo histórico, patrimonial y cultural.

### 8.1. Línea visual deseada
La interfaz debe transmitir:

- historia
- patrimonio
- antigüedad
- elegancia
- solemnidad cultural
- modernidad discreta

### 8.2. Colores base
Se puede conservar la línea cromática ya planteada, basada en tonos como:

- marrón profundo
- dorado opaco
- verde oliva
- tonos neutros tipo pergamino
- contrastes suaves y sobrios

### 8.3. Sensación general
La página no debe parecer comercial ni demasiado moderna.  
Debe sentirse como una **extensión digital del museo**, con una lectura cómoda, un estilo distinguido y una navegación limpia.

---

## 9. Requerimientos de administración
Desde la visión de negocio y operación, el museo necesita una gestión simple y ordenada.

### 9.1. Gestión de contenidos
El sistema debe permitir al museo:

- administrar todas las páginas asociadas a los QRs
- identificar rápidamente qué contenido corresponde a cada sección
- visualizar el estado de cada sección
- editar sin riesgo de afectar otras secciones
- mantener orden interno del material del recorrido

### 9.2. Gestión de material visual
Debe ser sencillo para el usuario autorizado:

- subir imágenes
- reemplazar imágenes antiguas
- actualizar videos
- definir qué imagen aparece como principal
- mantener una presentación ordenada del contenido

### 9.3. Gestión de recorrido
Se debe contemplar que el museo pueda:

- tener varias secciones activas a la vez
- modificar el orden del recorrido cuando sea necesario
- incorporar nuevas salas o etapas
- retirar temporalmente una sección sin eliminarla definitivamente

---

## 10. Requerimientos de seguridad y control de acceso
El museo necesita que el contenido tenga medidas de protección y control.  
Estas medidas deben estar contempladas desde el inicio como parte del requerimiento.

## 10.1. Restricción de acceso por QR
La intención es que cada enlace abierto por QR tenga un uso controlado, idealmente relacionado con la visita en curso.

Se busca que el acceso:

- esté vinculado al escaneo del QR en el recorrido
- no sea un enlace de libre uso permanente
- tenga una vigencia limitada
- no permita reutilización indefinida fuera del museo
- limite accesos posteriores cuando el tiempo de visita ya terminó

## 10.2. Temporalidad del acceso
Se desea que el enlace abierto desde el QR sea **transitorio**.

Esto implica solicitar que el sistema contemple medidas como:

- acceso válido por tiempo limitado
- vencimiento del acceso luego de un periodo definido
- restricción de reingreso posterior
- limitación para compartir el enlace fuera del contexto de la visita

## 10.3. Protección del contenido visual
Se requiere incorporar medidas para dificultar, en la mayor medida posible:

- descarga de imágenes
- descarga de videos
- copiado simple del material
- reutilización directa del contenido fuera de la experiencia

## 10.4. Protección frente a capturas de pantalla
Se desea que se contemplen mecanismos para **disuadir o dificultar** las capturas de pantalla del contenido visual.

**Aclaración importante:**  
Como requerimiento de negocio, el museo sí necesita esta protección; sin embargo, debe considerarse de forma realista que **no existe una forma absoluta de impedir capturas de pantalla o grabaciones en todos los dispositivos y navegadores**.  

Por ello, el proyecto debe contemplar una estrategia orientada a:

- desincentivar la captura
- dificultar la extracción directa del contenido
- minimizar la exposición libre del material
- proteger especialmente el contenido más sensible o exclusivo

## 10.5. Requerimientos de acceso restringido
El sistema debe evaluar medidas que ayuden a que el contenido:

- no quede disponible públicamente por tiempo indefinido
- no sea fácilmente indexable o compartible
- no pueda ser accedido libremente sin pasar por la experiencia prevista
- quede asociado a una experiencia temporal y controlada

---

## 11. Requerimientos de usabilidad
La experiencia debe ser fácil de usar para distintos tipos de visitantes.

### 11.1. Debe ser simple para el visitante
- acceso rápido desde el QR
- carga clara del contenido
- lectura cómoda
- botones comprensibles
- navegación intuitiva

### 11.2. Debe ser simple para el administrador
- edición amigable
- carga sencilla de material
- cambios rápidos de textos e imágenes
- estructura ordenada y comprensible

---

## 12. Requerimientos de contenido
Cada sección debe poder construirse como una ficha o página independiente, pero dentro de una misma identidad general.

Cada página debería permitir, según necesidad:

- nombre de la sección
- subtítulo
- descripción breve
- contenido desarrollado
- galería de imágenes
- video principal
- videos complementarios
- frase destacada o dato curioso
- bloque narrativo histórico
- llamada a continuar recorrido

---

## 13. Requerimientos de escalabilidad del proyecto
La solución debe pensarse no solo para una exposición actual, sino también para futuro crecimiento.

Se espera que permita:

- agregar más QRs sin rehacer todo el sistema
- incorporar nuevas salas o exposiciones
- reutilizar la misma lógica en recorridos temporales
- mantener una misma base visual y administrativa
- adaptarse a cambios curatoriales o museográficos

---

## 14. Requerimientos de operación interna
Desde la mirada del museo, el sistema debe facilitar la operación diaria.

Se requiere que el personal pueda:

- tener control del contenido publicado
- saber qué sección está activa
- actualizar materiales cuando cambie una exposición
- mantener coherencia entre el recorrido físico y el contenido digital
- gestionar de forma ordenada los contenidos sin desconfigurar la experiencia

---

## 15. Requerimientos de control institucional
La plataforma debe responder a las necesidades del museo como institución.

Debe ayudar a:

- preservar la imagen institucional
- proteger material visual e histórico
- asegurar una experiencia cuidada para el visitante
- mantener control sobre el acceso a contenido especial
- proyectar una imagen profesional, cultural y moderna

---

## 16. Consideraciones clave a dejar expresadas en la solicitud
Para esta iniciativa es importante dejar por escrito que:

### 16.1. No se busca una sola página genérica
Lo que se necesita es una **estructura reusable** que permita tener **múltiples páginas**, una por cada QR o punto del recorrido.

### 16.2. No se busca un contenido estático difícil de cambiar
Lo que se requiere es una plataforma **editable y administrable**, donde el museo pueda actualizar información, imágenes y videos.

### 16.3. La seguridad forma parte del requerimiento desde el inicio
El proyecto debe contemplar medidas de protección del acceso y del contenido, entendiendo que algunas restricciones pueden ser parciales y no absolutas.

### 16.4. La experiencia debe estar centrada en el recorrido real
El sistema debe sentirse como parte del recorrido del museo, no como una página web aislada.

---

## 17. Resultado esperado
Como resultado, el museo debe contar con una solución que permita:

- colocar distintos QRs en diferentes partes del recorrido
- mostrar una página distinta según cada QR
- administrar el contenido de cada sección
- mantener una estética histórica y elegante
- ofrecer una experiencia móvil clara y culturalmente cuidada
- aplicar medidas de control de acceso y protección del material
- escalar el sistema para futuras exposiciones o ampliaciones

---

## 18. Resumen ejecutivo
Se solicita una plataforma web para museo, basada en páginas por sección accesibles mediante códigos QR, con contenido administrable y una experiencia visual alineada a una identidad histórica y patrimonial.  

Cada QR debe llevar a una página distinta del recorrido, donde el visitante podrá visualizar información, imágenes y videos relacionados con esa sección.  

La institución necesita que esta solución sea autoadministrable, escalable, visualmente coherente, y que incluya medidas de seguridad orientadas a restringir accesos fuera del contexto de la visita, limitar la reutilización del enlace y dificultar la descarga o captura del contenido, dejando claro que la protección contra capturas nunca puede ser absoluta en todos los dispositivos.

---

## 19. Estado actual del desarrollo

### 19.1. Prototipos existentes de autenticación

Se cuenta con dos carpetas que implementan el módulo de autenticación como punto de partida del sistema:

| Carpeta | Rol | Descripción |
| --- | --- | --- |
| `prototipo_autenticacion_bk` | Backend | Prototipo del servidor/API de autenticación |
| `prototipo_autenticacion_fe` | Frontend | Prototipo de la interfaz de autenticación |

Estos prototipos cubren parte del requerimiento planteado en el punto **10 (Seguridad y control de acceso)**, particularmente lo relacionado con:

- acceso restringido al panel de administración (punto 10.5)
- identificación del personal autorizado para gestión de contenido (punto 7, sección administrador)

### 19.2. Implicancias para el plan

El módulo de autenticación ya tiene una base de trabajo. Los siguientes pasos del proyecto deben:

- revisar y consolidar ambos prototipos antes de avanzar con nuevas funcionalidades
- asegurarse de que la autenticación del administrador quede integrada con el panel de gestión de contenido
- definir si el visitante requiere algún tipo de autenticación o token por QR (acceso temporal, punto 10.2)

---

## 20. Anexo: lista resumida de necesidades del usuario
### Como museo, se necesita:
- tener varios QRs para distintas secciones
- que cada QR abra una página distinta
- que cada página muestre contenido de esa sección
- que el contenido se pueda editar fácilmente
- que se puedan cambiar imágenes, videos y textos
- que exista una plantilla uniforme para todas las secciones
- que la estética sea histórica, elegante y cultural
- que el acceso al contenido sea controlado
- que el enlace no quede libre para siempre
- que se dificulte la descarga y captura del contenido
- que el sistema permita crecer a futuro
