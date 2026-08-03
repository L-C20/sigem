# Modelo de Base de Datos

## Objetivo

Diseñar una base de datos relacional, escalable y normalizada para administrar la Escuela de Música.

## Entidades identificadas

- Usuarios
- Roles
- Filiales
- Alumnos
- Instructores
- Instrumentos
- Materia
- Inscripciones
- Asistencias
- Períodos Lectivos

## Reglas de diseño

1. Todas las tablas tendrán una clave primaria llamada `id`.
2. Las relaciones entre tablas se harán mediante claves foráneas (`id`), nunca usando nombres o DNI.
3. Los valores de listas fijas (estados, roles, instrumentos, filiales, etc.) se almacenarán en tablas independientes.
4. La base de datos deberá conservar el historial de información y evitar la duplicación de datos.