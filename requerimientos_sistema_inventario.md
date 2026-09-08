# Documento de Requerimientos Funcionales

**Proyecto:** Sistema de Control de Inventarios en Consignación  
**Estado:** Versión Inicial para Revisión  
**Objetivo General:** Desarrollar un sistema centralizado que permita gestionar de forma eficiente el inventario de mercancía propia y bajo el modelo de consignación con múltiples clientes, asegurando la trazabilidad de los movimientos físicos y automatizando las bajas por venta.

---

## 1. Módulos Principales del Sistema

| Módulo | Descripción Funcional |
| :--- | :--- |
| **Control de Inventarios** | Gestión integral de existencias, transferencias entre almacenes virtuales y control de bajas automáticas. |
| **Mantenimiento de Artículos** | Catálogo maestro de productos (creación, edición y administración de SKUs, descripciones y propiedades). |
| **Mantenimiento de Clientes** | Catálogo de clientes con asignación de almacenes virtuales específicos para la mercancía en consignación. |
| **Reportes Estadísticos** | Módulo analítico avanzado para evaluar rotación, tiempos de permanencia y rendimientos comerciales. |

---

## 2. Flujo de Operación y Reglas de Negocio

### A. Gestión del Almacén Central (Origen)
* El almacén central actúa como el nodo principal de alimentación del inventario.
* **Métodos de Carga:** Se debe soportar el ingreso manual de productos uno a uno y la **importación masiva a través de archivos de Excel (`.xlsx` / `.csv`)**.

### B. Envío de Mercancía a Consignación (Desplazamiento)
* Al enviar mercancía a un cliente, el sistema debe trasladar el stock del Almacén Central a un sub-almacén virtual asignado de forma dinámica (ej. *Almacén Cliente X*).
* El sistema operará bajo un modelo flexible que permita enviar mercancía *N* veces a *N* número de clientes simultáneamente.
* **Restricción Obligatoria:** Para liberar la entrega de la mercancía, el sistema debe emitir e **imprimir un soporte o vale de entrega físico** detallando los artículos trasladados.

### C. Proceso de Devolución de Mercancía
* El cliente podrá retornar la mercancía no vendida hacia el Almacén Central (Origen).
* **Restricción Obligatoria:** El reingreso al inventario central exige la generación e **impresión de un soporte de devolución** firmado que avale la recepción física.

### D. Legalización de Ventas y Bajas
* Al notificarse una venta por parte del cliente, el sistema procesará la transacción generando una **Nota de Remisión**.
* Dicha Nota de Remisión se canalizará de manera inmediata al área de facturación.
* **Impacto en Inventario:** La emisión de la Nota de Remisión ejecutará automáticamente la **baja definitiva de las unidades del inventario del cliente**.

---

## 3. Indicadores Clave y Reportes Estadísticos

El módulo estadístico debe procesar la información de los movimientos para calcular:

1. **Tasa de Devolución:** Porcentaje exacto de mercancía retornada al origen en relación a lo entregado.
2. **Tasa de Venta:** Porcentaje de mercancía vendida y legalizada frente al total en consignación.
3. **Antigüedad en Consignación:** Tiempo de permanencia de los artículos bajo el resguardo del cliente.
4. **Producto Estrella (*Top Seller*):** Reporte de los artículos con mayor volumen de venta global e individualizado.
5. **Filtros Dinámicos:** Capacidad de segmentar de manera cruzada por artículos, clientes y ventanas de tiempo.
6. **Edad del Inventario Central:** Tiempo de permanencia de un artículo dentro del Almacén Central antes de rotar.
