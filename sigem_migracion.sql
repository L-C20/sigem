--
-- PostgreSQL database dump
--

\restrict VQOiuASQNIBT0k6YiAKlXlkDEuXspWbnZFKm9XYHjfDwRTQzh88oWhBc0I4NtGL

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: filiales; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.filiales VALUES (4, 'Barrancas');
INSERT INTO public.filiales VALUES (5, 'Barrio La Gloria');
INSERT INTO public.filiales VALUES (6, 'Chacras de Coria');
INSERT INTO public.filiales VALUES (8, 'Dorrego');
INSERT INTO public.filiales VALUES (9, 'Godoy Cruz');
INSERT INTO public.filiales VALUES (10, 'Las Heras');
INSERT INTO public.filiales VALUES (11, 'Lavalle');
INSERT INTO public.filiales VALUES (12, 'Luján');
INSERT INTO public.filiales VALUES (13, 'Maipú');
INSERT INTO public.filiales VALUES (14, 'Palmira');
INSERT INTO public.filiales VALUES (15, 'Plumerillo');
INSERT INTO public.filiales VALUES (16, 'Rodeo de la Cruz');
INSERT INTO public.filiales VALUES (17, 'San Martin');
INSERT INTO public.filiales VALUES (18, 'Ugarteche');
INSERT INTO public.filiales VALUES (19, 'Uspallata');
INSERT INTO public.filiales VALUES (20, 'Villanueva');
INSERT INTO public.filiales VALUES (21, 'Ballofet');
INSERT INTO public.filiales VALUES (22, 'Colonia Bombal');
INSERT INTO public.filiales VALUES (23, 'Las Catitas');
INSERT INTO public.filiales VALUES (24, 'Nueva California');
INSERT INTO public.filiales VALUES (25, 'Tres Porteñas');
INSERT INTO public.filiales VALUES (26, 'Los Corralitos');


--
-- Data for Name: alumnos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.alumnos VALUES (17, NULL, 'Octavio', 'Andrada', '2612721714', '', 5, '', NULL, '', '', false, NULL);


--
-- Data for Name: instrumentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.instrumentos VALUES (1, 'Órgano');
INSERT INTO public.instrumentos VALUES (2, 'Bajo');
INSERT INTO public.instrumentos VALUES (3, 'Violín');
INSERT INTO public.instrumentos VALUES (4, 'Viola');
INSERT INTO public.instrumentos VALUES (5, 'Violoncello');
INSERT INTO public.instrumentos VALUES (6, 'Clarinete');
INSERT INTO public.instrumentos VALUES (7, 'Flauta');
INSERT INTO public.instrumentos VALUES (8, 'Saxofón');
INSERT INTO public.instrumentos VALUES (9, 'Oboe');
INSERT INTO public.instrumentos VALUES (10, 'Trompeta');
INSERT INTO public.instrumentos VALUES (11, 'Corno');
INSERT INTO public.instrumentos VALUES (12, 'Trombón/Tuba');


--
-- Data for Name: instructores; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.instructores VALUES (26, 'Cesia', 'Vargas', '2612077339', 'Activo', true, 3);
INSERT INTO public.instructores VALUES (5, 'Analía', 'Díaz', '2613846766', 'Activo', true, NULL);
INSERT INTO public.instructores VALUES (10, 'Gisela', 'Jurado', '2614721465', 'Activo', true, NULL);
INSERT INTO public.instructores VALUES (15, 'Natalia', 'Paz', '2616129368', 'Activo', true, NULL);
INSERT INTO public.instructores VALUES (16, 'Grisel', 'Ridissi', '2615129049', 'Activo', true, NULL);
INSERT INTO public.instructores VALUES (18, 'Marina', 'Sepúlveda', '2615169564', 'Activo', true, NULL);
INSERT INTO public.instructores VALUES (1, 'Mauro', 'Abarca', '2613908485', 'Activo', false, 11);
INSERT INTO public.instructores VALUES (20, 'Jhonatan', 'Torres', '2616517900', 'Activo', false, 11);
INSERT INTO public.instructores VALUES (2, 'Claudia', 'Borgia', '2613078888', 'Activo', false, 4);
INSERT INTO public.instructores VALUES (7, 'Matías', 'Griffuliere', '2616187144', 'Activo', false, 3);
INSERT INTO public.instructores VALUES (22, 'Maicol', 'Tula', '2634659183', 'Activo', false, 3);
INSERT INTO public.instructores VALUES (23, 'Milagros', 'Tula', '2634216828', 'Activo', false, 3);
INSERT INTO public.instructores VALUES (28, 'Fernando', 'Velázquez', '2622403995', 'Activo', false, 3);
INSERT INTO public.instructores VALUES (3, 'Lucas', 'Contardi', '2613002642', 'Activo', false, 3);
INSERT INTO public.instructores VALUES (14, 'Mauricio', 'Manrique', '2612112823', 'Activo', false, 3);
INSERT INTO public.instructores VALUES (4, 'Leonardo', 'Darío', '2616835004', 'Activo', false, 6);
INSERT INTO public.instructores VALUES (9, 'Mauro', 'Hernández', '2614698812', 'Activo', false, 6);
INSERT INTO public.instructores VALUES (12, 'Lucas', 'Lo Bianco', '2616180270', 'Activo', false, 10);
INSERT INTO public.instructores VALUES (8, 'Franco', 'Hernández', '2616618911', 'Activo', false, 1);
INSERT INTO public.instructores VALUES (17, 'Laura', 'Sepúlveda', '2634572966', 'Activo', false, 1);
INSERT INTO public.instructores VALUES (29, 'Pablo', 'Zenoff', '2615868480', 'Activo', false, 1);
INSERT INTO public.instructores VALUES (11, 'Verónica', 'Jurado', '2616215871', 'Activo', false, 9);
INSERT INTO public.instructores VALUES (13, 'Mauricio', 'Lozano', '2616411276', 'Activo', false, 5);
INSERT INTO public.instructores VALUES (19, 'Cristian', 'Torres', '2615969243', 'Activo', false, 8);
INSERT INTO public.instructores VALUES (30, 'David', 'Melfa', '2615260150', 'Activo', false, 8);
INSERT INTO public.instructores VALUES (21, 'Luis', 'Torres', '2615324968', 'Activo', false, 12);
INSERT INTO public.instructores VALUES (25, 'Ammiel', 'Vargas', '2612161676', 'Activo', false, 2);
INSERT INTO public.instructores VALUES (27, 'Rode', 'Vargas', '2612085793', 'Activo', false, 7);
INSERT INTO public.instructores VALUES (24, 'Vanesa', 'Valdez', '2615450268', 'Activo', false, NULL);
INSERT INTO public.instructores VALUES (6, 'Lucas', 'Frazzeto', '2615944527', 'Activo', false, 10);


--
-- Data for Name: asistencias_instructores; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.asistencias_instructores VALUES (1, 26, '2026-08-08', true, NULL);
INSERT INTO public.asistencias_instructores VALUES (2, 1, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (3, 2, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (4, 3, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (5, 4, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (6, 5, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (7, 6, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (8, 7, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (9, 8, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (10, 9, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (11, 10, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (12, 11, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (13, 12, '2026-08-08', true, NULL);
INSERT INTO public.asistencias_instructores VALUES (14, 13, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (15, 14, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (16, 30, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (17, 15, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (18, 16, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (19, 17, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (20, 18, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (21, 19, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (22, 20, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (23, 21, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (24, 22, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (25, 23, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (26, 24, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (27, 25, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (28, 26, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (29, 27, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (30, 28, '2026-08-08', false, NULL);
INSERT INTO public.asistencias_instructores VALUES (31, 29, '2026-08-08', false, NULL);


--
-- Data for Name: niveles_instrumento; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.niveles_instrumento VALUES (1, 'Nivel 1');
INSERT INTO public.niveles_instrumento VALUES (2, 'Nivel 2');
INSERT INTO public.niveles_instrumento VALUES (3, 'Nivel 3');
INSERT INTO public.niveles_instrumento VALUES (4, 'Nivel 4');
INSERT INTO public.niveles_instrumento VALUES (5, 'Nivel 5');
INSERT INTO public.niveles_instrumento VALUES (6, 'Nivel 6');
INSERT INTO public.niveles_instrumento VALUES (7, 'Perfeccionamiento');


--
-- Data for Name: cursada_instrumento; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.cursada_instrumento VALUES (10, 17, 10, 1, 12, 2026, 'Activo');


--
-- Data for Name: asistencias_instrumento; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: niveles_teoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.niveles_teoria VALUES (3, 'Nivel 2');
INSERT INTO public.niveles_teoria VALUES (4, 'Nivel 3');
INSERT INTO public.niveles_teoria VALUES (5, 'Nivel 4');
INSERT INTO public.niveles_teoria VALUES (2, 'Nivel 1 A');
INSERT INTO public.niveles_teoria VALUES (6, 'Nivel 1 B');


--
-- Data for Name: cursadas_teoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.cursadas_teoria VALUES (26, 17, 4, 26, 2026, 'Activo');


--
-- Data for Name: asistencias_teoria; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: cursadas_instrumento; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: instruccion_ministerial; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.instruccion_ministerial VALUES (6, 17, NULL, NULL, 'No pertenece', '');


--
-- Data for Name: instructor_instrumentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.instructor_instrumentos VALUES (1, 1, 11);
INSERT INTO public.instructor_instrumentos VALUES (2, 2, 4);
INSERT INTO public.instructor_instrumentos VALUES (3, 3, 3);
INSERT INTO public.instructor_instrumentos VALUES (4, 4, 6);
INSERT INTO public.instructor_instrumentos VALUES (5, 6, 10);
INSERT INTO public.instructor_instrumentos VALUES (6, 7, 3);
INSERT INTO public.instructor_instrumentos VALUES (7, 8, 1);
INSERT INTO public.instructor_instrumentos VALUES (8, 9, 6);
INSERT INTO public.instructor_instrumentos VALUES (9, 11, 9);
INSERT INTO public.instructor_instrumentos VALUES (10, 12, 10);
INSERT INTO public.instructor_instrumentos VALUES (11, 13, 5);
INSERT INTO public.instructor_instrumentos VALUES (12, 14, 3);
INSERT INTO public.instructor_instrumentos VALUES (13, 19, 8);
INSERT INTO public.instructor_instrumentos VALUES (14, 20, 11);
INSERT INTO public.instructor_instrumentos VALUES (15, 21, 12);
INSERT INTO public.instructor_instrumentos VALUES (16, 22, 3);
INSERT INTO public.instructor_instrumentos VALUES (17, 23, 3);
INSERT INTO public.instructor_instrumentos VALUES (18, 24, 3);
INSERT INTO public.instructor_instrumentos VALUES (19, 25, 2);
INSERT INTO public.instructor_instrumentos VALUES (20, 26, 3);
INSERT INTO public.instructor_instrumentos VALUES (21, 27, 7);
INSERT INTO public.instructor_instrumentos VALUES (22, 28, 3);
INSERT INTO public.instructor_instrumentos VALUES (23, 29, 1);
INSERT INTO public.instructor_instrumentos VALUES (24, 30, 8);
INSERT INTO public.instructor_instrumentos VALUES (25, 17, 1);


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: alumnos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alumnos_id_seq', 17, true);


--
-- Name: asistencias_instructores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asistencias_instructores_id_seq', 31, true);


--
-- Name: asistencias_instrumento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asistencias_instrumento_id_seq', 10, true);


--
-- Name: asistencias_teoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asistencias_teoria_id_seq', 2, true);


--
-- Name: cursada_instrumento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cursada_instrumento_id_seq', 10, true);


--
-- Name: cursadas_instrumento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cursadas_instrumento_id_seq', 1, true);


--
-- Name: cursadas_teoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cursadas_teoria_id_seq', 26, true);


--
-- Name: filiales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.filiales_id_seq', 26, true);


--
-- Name: instruccion_ministerial_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.instruccion_ministerial_id_seq', 6, true);


--
-- Name: instructor_instrumentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.instructor_instrumentos_id_seq', 25, true);


--
-- Name: instructores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.instructores_id_seq', 31, true);


--
-- Name: instrumentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.instrumentos_id_seq', 12, true);


--
-- Name: niveles_instrumento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.niveles_instrumento_id_seq', 7, true);


--
-- Name: niveles_teoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.niveles_teoria_id_seq', 6, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

\unrestrict VQOiuASQNIBT0k6YiAKlXlkDEuXspWbnZFKm9XYHjfDwRTQzh88oWhBc0I4NtGL

