# MANUAL DE USUARIO Y OPERACIÓN DEL SISTEMA
## ConsignLedger Pro — Sistema Integral de Control de Inventarios en Consignación
**Versión del Sistema:** 2.0 Cloud Edition  
**Fecha de Documentación:** Septiembre 2026  
**Clasificación:** Documento Operativo / Guía Oficial del Usuario

---

## ÍNDICE GENERAL

1. [Introducción y Fundamentos del Sistema](#1-introducción-y-fundamentos-del-sistema)
2. [El Ciclo de Vida de la Mercancía en Consignación](#2-el-ciclo-de-vida-de-la-mercancía-en-consignación)
3. [Perfiles de Usuario y Matriz de Permisos](#3-perfiles-de-usuario-y-matriz-de-permisos)
4. [Módulo 1: Acceso al Sistema y Seguridad](#4-módulo-1-acceso-al-sistema-y-seguridad)
5. [Módulo 2: Catálogo de Artículos (Inventario Central)](#5-módulo-2-catálogo-de-artículos-inventario-central)
   - 5.1 Alta Manual de Artículos
   - 5.2 Importación Masiva mediante Excel / CSV
6. [Módulo 3: Directorio de Clientes y Almacenes Virtuales](#6-módulo-3-directorio-de-clientes-y-almacenes-virtuales)
7. [Módulo 4: Despacho a Consignación y Vale de Entrega (VALE-ENT)](#7-módulo-4-despacho-a-consignación-y-vale-de-entrega-vale-ent)
8. [Módulo 5: Devolución de Mercancía y Vale de Retorno (VALE-DEV)](#8-módulo-5-devolución-de-mercancía-y-vale-de-retorno-vale-dev)
9. [Módulo 6: Cortes de Conciliación y Notas de Remisión (REM-VTA)](#9-módulo-6-cortes-de-conciliación-y-notas-de-remisión-rem-vta)
10. [Módulo 7: Panel de Control (Dashboard) y Métricas Oficiales](#10-módulo-7-panel-de-control-dashboard-y-métricas-oficiales)
11. [Módulo 8: Configuración de Empresa, Logo y Personal](#11-módulo-8-configuración-de-empresa-logo-y-personal)
12. [Preguntas Frecuentes y Buenas Prácticas de Negocio](#12-preguntas-frecuentes-y-buenas-prácticas-de-negocio)

---

## 1. INTRODUCCIÓN Y FUNDAMENTOS DEL SISTEMA

El **Sistema de Control de Inventarios en Consignación** es una plataforma web desarrollada para administrar con absoluta precisión el flujo de mercancías entre su **Almacén Central (Bodega Matriz)** y los diferentes **puntos de venta o clientes distribuidores**.

### Principio Jurídico y Operativo:
> **La mercancía entregada en consignación sigue siendo propiedad legal de la empresa** mientras permanezca en resguardo del cliente, hasta el momento en que se legalice su venta mediante una **Nota de Remisión** o se reciba de vuelta mediante un **Vale de Devolución**.

El sistema elimina las pérdidas y diferencias de inventario al asegurar que **ningún producto se mueve sin un documento digital imprimible debidamente firmado**.

---

## 2. EL CICLO DE VIDA DE LA MERCANCÍA EN CONSIGNACIÓN

A continuación se describe el flujo físico y contable garantizado por el sistema:

```
 [ALMACÉN CENTRAL] ──(1. Transferencia)──> Emisión obligatoria de VALE-ENT
         │                                       │
         │                                       ▼
         │                          [SUB-ALMACÉN VIRTUAL CLIENTE]
         │                                       │
         ├──────(2. Devolución no vendida)───────┤ (Mercancía en custodia)
         │       Emisión de VALE-DEV             │
         │                                       ▼
         │                                (3. Venta al público)
         │                                       │
         └─────────────(4. Corte)────────────────┘
                 Emisión de NOTA DE REMISIÓN (REM-VTA)
                                 │
                                 ▼
                     Canalizado a FACTURACIÓN
                     Baja definitiva de inventario
```

---

## 3. PERFILES DE USUARIO Y MATRIZ DE PERMISOS

Para garantizar la integridad y seguridad en la operación diaria, el sistema implementa un esquema de **Control de Acceso Basado en Roles (RBAC)**:

| Funcionalidad / Módulo | Administrador (`admin`) | Almacén (`almacen`) | Facturación (`facturacion`) |
| :--- | :---: | :---: | :---: |
| **Ver Dashboard y Métricas** |  Total |  Total |  Total |
| **Alta manual / Excel de Artículos** |  Permitido |  Permitido | ❌ Solo Lectura |
| **Editar / Borrar Artículos** |  Permitido |  Permitido | ❌ Denegado |
| **Crear / Editar Clientes** |  Permitido |  Permitido |  Permitido |
| **Enviar a Consignación (`VALE-ENT`)** |  Permitido |  Permitido | ❌ Denegado |
| **Registrar Devoluciones (`VALE-DEV`)** |  Permitido |  Permitido | ❌ Denegado |
| **Generar Cortes y Remisiones (`REM-VTA`)** |  Permitido | ❌ Denegado |  Permitido |
| **Imprimir Comprobantes Oficiales** |  Permitido |  Permitido |  Permitido |
| **Modificar Datos Fiscales y Logo** |  Permitido | ❌ Denegado | ❌ Denegado |
| **Alta y Gestión de Usuarios/Claves** |  Permitido | ❌ Denegado | ❌ Denegado |

---

## 4. MÓDULO 1: ACCESO AL SISTEMA Y SEGURIDAD

### 4.1 Ingreso a la Plataforma
1. Ingrese a la dirección web provista (enlace en la nube o red corporativa).
2. Escriba su **Correo Electrónico** y **Contraseña**.
3. Haga clic en el botón **"Iniciar Sesión"**.
4. El sistema validará su perfil y adaptará las opciones de la barra lateral según sus privilegios.

### 4.2 Cierre de Sesión
* En la barra superior derecha, haga clic en el botón con icono de salida **"Cerrar Sesión"**.
* Por seguridad, siempre cierre su sesión al terminar su turno para evitar que personas no autorizadas registren movimientos con su nombre.

---

## 5. MÓDULO 2: CATÁLOGO DE ARTÍCULOS (INVENTARIO CENTRAL)

Permite visualizar la totalidad de los artículos disponibles en la Bodega Central y su stock en custodia con clientes.

### 5.1 Alta Manual de un Artículo
1. En el menú lateral, diríjase a **"Catálogo"**.
2. Presione el botón **"+ Nuevo Artículo"**.
3. Complete los campos obligatorios:
   * **SKU / Código Único:** Identificador de producto (ej. `SKU-LAP-001`).
   * **Nombre del Producto:** Descripción comercial completa.
   * **Categoría:** Grupo al que pertenece (ej. Laptops, Audio, Accesorios).
   * **Precio de Venta ($):** Precio unitario oficial asignado para el cliente.
   * **Stock Inicial Almacén Central:** Cantidad de unidades físicas que ingresan a bodega.
   * **Stock Mínimo de Alerta:** Cantidad mínima para disparar avisos de reabastecimiento.
4. Haga clic en **"Guardar Artículo"**.

### 5.2 Importación Masiva mediante Excel (`.xlsx` o `.csv`)
Cuando se tienen decenas o cientos de productos nuevos, use la carga masiva:
1. En **"Catálogo"**, presione el botón **"📥 Importar Excel / CSV"**.
2. En la ventana emergente, haga clic en **"Descargar Plantilla de Ejemplo (.xlsx)"**.
3. Abra la plantilla en su computadora y capture los datos respetando las columnas:
   * `sku`, `name`, `category`, `price`, `stock_central`, `min_stock`.
4. Guarde el archivo en Excel y arrástrelo o selecciónelo en la ventana del sistema.
5. El sistema procesará el archivo al instante, validará que no haya códigos repetidos y cargará los artículos de forma masiva.

---

## 6. MÓDULO 3: DIRECTORIO DE CLIENTES Y ALMACENES VIRTUALES

Cada cliente registrado cuenta con su propio **Sub-Almacén Virtual Dinámico** (con nomenclatura automática `ALM-VIR-XXXX`).

### 6.1 Registro de un Nuevo Cliente
1. Diríjase a la sección **"Clientes"** en el menú lateral.
2. Haga clic en **"+ Nuevo Cliente"**.
3. Ingrese los datos fiscales y de contacto:
   * Nombre o Razón Social.
   * RFC.
   * Nombre de Contacto, Teléfono y Correo.
   * Dirección de entrega física.
4. Al guardar, el sistema le asignará de inmediato su identificador de sub-almacén.

### 6.2 Consulta de Existencias en Resguardo
* Dentro de la ficha de cada cliente, haga clic en **"Ver Inventario en Consignación"**.
* Podrá ver exactamente qué modelos tiene el cliente en su sucursal, cuántas piezas de cada uno, el valor económico total y los días que llevan en custodia.

---

## 7. MÓDULO 4: DESPACHO A CONSIGNACIÓN Y VALE DE ENTREGA (`VALE-ENT`)

Este proceso se realiza cada vez que sale mercancía del Almacén Central hacia el establecimiento del cliente.

### 7.1 Procedimiento de Envío:
1. Diríjase a **"Movimientos"** o presione el acceso rápido **"Enviar a Consignación"**.
2. Seleccione el **Cliente Destino**.
3. Seleccione los productos y capture las cantidades a trasladar. *(El sistema no permitirá enviar más unidades de las existentes físicamente en la Bodega Central)*.
4. Ingrese observaciones o número de guía de transporte si aplica.
5. Presione **"Confirmar Envío y Generar Vale"**.

### 7.2 Emisión Obligatoria del Vale Físico:
* De manera automática se abrirá el formato imprimible del **Vale de Entrega (`VALE-ENT-XXXX`)**.
* **Protocolo de firmas indispensable:**
  1. **Firma Almacén Matriz:** Responsable que sacó la mercancía de estantería.
  2. **Firma Chofer / Transportista:** Quien traslada los bultos.
  3. **Firma y Sello del Cliente:** Quien recibe físicamente en la sucursal de destino.
* Puede presionar **"Imprimir"** para enviarlo a la impresora o guardarlo como archivo PDF digital.

---

## 8. MÓDULO 5: DEVOLUCIÓN DE MERCANCÍA Y VALE DE RETORNO (`VALE-DEV`)

Aplica cuando el cliente no vendió la mercancía en el plazo convenido o solicita el cambio de artículos por rotación.

### 8.1 Procedimiento de Reingreso:
1. Vaya a la sección **"Movimientos"** y seleccione **"Registrar Devolución"**.
2. Seleccione el cliente que devuelve.
3. El sistema desplegará únicamente los artículos que dicho cliente tiene actualmente en custodia.
4. Ingrese la cantidad a retornar y el motivo (ej. *Fin de exhibición*, *Baja rotación*).
5. Haga clic en **"Procesar Devolución"**.

### 8.2 Emisión del Vale de Devolución:
* Se generará el comprobante oficial **`VALE-DEV-XXXX`**.
* En el momento que se registra, **las piezas se descuentan del Sub-almacén del cliente y se suman de regreso automáticamente al Almacén Central**.
* Imprima el vale para que el encargado de almacén firme la recepción y el cliente conserve su copia de descargo.

---

## 9. MÓDULO 6: CORTES DE CONCILIACIÓN Y NOTAS DE REMISIÓN (`REM-VTA`)

Este módulo es la médula del negocio y es operado comúnmente por el departamento de **Facturación / Administración**.

### 9.1 ¿Cuándo realizar una Conciliación?
Al final de la semana, quincena o mes, o cuando el cliente reporte que vendió piezas de su lote en consignación.

### 9.2 Proceso de Corte y Legalización:
1. Ingrese a la pestaña **"Cortes / Facturación"**.
2. Seleccione el cliente a conciliar.
3. El sistema listará el inventario activo del cliente.
4. En la columna **"Cantidad Vendida"**, capture el número de piezas que el cliente reportó como vendidas.
5. Verifique el importe total generado.
6. Haga clic en **"Generar Nota de Remisión"**.

### 9.3 Efectos Inmediatos del Sistema:
1. **Baja Definitiva:** El sistema descuenta esas unidades del inventario del cliente (ya no constan en custodia).
2. **Generación de `REM-VTA-XXXX`:** Se emite la Nota de Remisión oficial con desglose de importes, precios unitarios y subtotal/total.
3. **Pase a Facturación:** El personal de finanzas utiliza el folio de remisión para emitir la factura final al cliente y proceder al cobro.

---

## 10. MÓDULO 7: PANEL DE CONTROL (DASHBOARD) Y MÉTRICAS OFICIALES

El sistema calcula de forma automatizada los **6 indicadores estadísticos clave** del negocio:

1. **Tasa de Venta (%):**
   * *Fórmula:* `(Unidades Vendidas / Total Unidades Enviadas) * 100`
   * Muestra la efectividad comercial del inventario colocado.
2. **Tasa de Devolución (%):**
   * *Fórmula:* `(Unidades Devueltas / Total Unidades Enviadas) * 100`
   * Permite identificar clientes o productos que no están rotando y representan fletes infructuosos.
3. **Antigüedad Promedio en Consignación:**
   * Promedio de días que los productos pasan en el piso de venta del cliente antes de venderse o regresarse.
4. **Edad del Inventario Central:**
   * Tiempo promedio que un lote de mercancía permanece inactivo en la Bodega Matriz antes de salir a consignación.
5. **Top Sellers (Productos Estrella):**
   * Gráfica y ranking de los artículos con mayor volumen y valor monetario vendido.
6. **Filtros Dinámicos Cruzados:**
   * Permite segmentar todos los gráficos por rango de fechas, por cliente específico o por categoría de producto.

---

## 11. MÓDULO 8: CONFIGURACIÓN DE EMPRESA, LOGO Y PERSONAL

*(Disponible exclusivamente para usuarios con rol de **Administrador**)*.

### 11.1 Ajuste de Datos de la Empresa y Logotipo
1. En la parte superior derecha, presione el botón **"⚙ Ajustes Empresa"**.
2. Podrá editar en cualquier momento:
   * **Razón Social** y **RFC**.
   * **Dirección Fiscal**, Teléfonos y Correo de Contacto.
   * **Logotipo:** Puede ingresar un enlace directo a la imagen o cargar un archivo (PNG, JPG, SVG) desde su equipo. El logo aparecerá de inmediato en la barra superior y en el membrete de todos los vales impresos.
   * **Cláusula Legal:** Texto que aparece al pie de los vales donde se especifica la responsabilidad civil y custodia de la mercancía.
3. Guarde los cambios para que se apliquen en todo el sistema.

### 11.2 Gestión de Usuarios y Accesos
1. En la barra superior, presione el botón **"👥 Usuarios"**.
2. Puede:
   * Dar de alta nuevos empleados asignándoles su correo y contraseña.
   * Definir su rol (`Almacén`, `Facturación` o `Administrador`).
   * Restablecer contraseñas en caso de extravío.
   * Desactivar o eliminar operadores que ya no laboren en la empresa.

### 11.3 Inicialización para Producción Real
* En la ventana de ajustes de empresa se cuenta con la opción **"Limpiar Datos para Producción"**.
* Utilice este botón únicamente cuando vaya a arrancar la operación en vivo con el cliente, para borrar los datos de prueba y comenzar con un inventario en ceros.

---

## 12. PREGUNTAS FRECUENTES Y BUENAS PRÁCTICAS DE NEGOCIO

#### ¿Qué ocurre si un cliente reporta mercancía dañada o extraviada en su tienda?
Debe registrarse a través de una conciliación de corte para legalizar el cobro del producto al cliente, o mediante una devolución asentando en las observaciones la condición física del artículo para reclamo del seguro.

#### ¿Se pueden reimprimir vales de fechas anteriores?
Sí. En el historial de movimientos o cortes puede volver a abrir cualquier vale (`VALE-ENT`, `VALE-DEV` o `REM-VTA`) en cualquier momento y volverlo a imprimir con su folio y fecha original inalterable.

#### ¿Cómo respaldar la información?
El sistema almacena toda la información de manera centralizada en la base de datos empresarial del servidor en la nube. Con el volumen de datos adjunto en la plataforma, las existencias y documentos se mantienen permanentemente respaldados.

---

*Manual elaborado conforme a la Especificación Técnica y Requerimientos Funcionales del Sistema de Control de Inventarios en Consignación.*
