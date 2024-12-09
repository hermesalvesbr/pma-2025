--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.2 (Ubuntu 17.2-1.pgdg22.04+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Folha; Type: TABLE; Schema: public; Owner: exampleUser
--

CREATE TABLE public."Folha" (
    id text NOT NULL,
    "unidadeGestoraCodigo" integer NOT NULL,
    "unidadeGestoraNome" text NOT NULL,
    "matriculaNumero" text NOT NULL,
    "matriculaCpf" text NOT NULL,
    "matriculaNome" text NOT NULL,
    "dataAdmissao" timestamp(3) without time zone,
    "tipoContratacao" text,
    vinculo text NOT NULL,
    "localNome" text NOT NULL,
    "cargoCodigo" text NOT NULL,
    "cargoNome" text NOT NULL,
    "funcaoNome" text,
    "nrHorasSemanais" double precision NOT NULL,
    "salarioBase" double precision NOT NULL,
    "totalVantagens" double precision NOT NULL,
    "totalDescontos" double precision NOT NULL,
    "criadoEm" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "atualizadoEm" timestamp(3) without time zone NOT NULL,
    "estruturaClasse" text,
    "estruturaNivel" text,
    local text
);



--
-- Name: Folha Folha_pkey; Type: CONSTRAINT; Schema: public; Owner: exampleUser
--

ALTER TABLE ONLY public."Folha"
    ADD CONSTRAINT "Folha_pkey" PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

