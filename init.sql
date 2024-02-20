-- EXTENSIONS --
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SEQUENCES --

-- TABLES __
CREATE TABLE IF NOT EXISTS tenants (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(255),
    deepgram_api_key VARCHAR(36) NOT NULL UNIQUE, 
    deepgram_project VARCHAR(36) NOT NULL UNIQUE, 
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS main_info (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    church_key VARCHAR(36) NOT NULL,
    host_lanugage VARCHAR(30),
    translation_languages json,
    service_timeout_min int,
    test_mode boolean
);

CREATE TABLE IF NOT EXISTS main_theming_info (
    id uuiD NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    greeting text,
    message text,
    additional_welcome text,
    waiting_message text,
    logo bytea,
);