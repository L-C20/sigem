-- ===============================================
-- RECURSANTE: MARCA MANUAL EN LA CURSADA
-- ===============================================

-- El reporte ya detecta al recursante contando las cursadas del mismo
-- nivel. Eso solo funciona si la cursada anterior esta en el sistema, y
-- hoy no lo esta: en produccion todas las cursadas son de 2026, no hay
-- historial. Un chico que repite Nivel 3 porque lo curso en 2024, antes
-- de que existiera SIGEM, es invisible para el conteo.
--
-- Esta marca es para esos casos: la pone una persona en la ficha.
--
-- Va en la cursada y no en el alumno porque ser recursante es propiedad
-- de este nivel en este anio, no de la persona: el mismo chico puede
-- estar recursando Nivel 3 y haber hecho Nivel 2 una sola vez.
--
-- El reporte muestra "recursa" si lo dice el conteo O si lo dice esta
-- marca. Cuando lo dice el conteo ademas puede decir en que anios lo
-- curso antes; cuando solo lo dice la marca, no hay de donde sacarlo.

ALTER TABLE cursadas_teoria
    ADD COLUMN IF NOT EXISTS recursante BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE cursada_instrumento
    ADD COLUMN IF NOT EXISTS recursante BOOLEAN NOT NULL DEFAULT FALSE;


-- Para deshacerlo:
--   ALTER TABLE cursadas_teoria     DROP COLUMN recursante;
--   ALTER TABLE cursada_instrumento DROP COLUMN recursante;
