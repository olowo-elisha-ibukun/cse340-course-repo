-- Drop tables if they exist
DROP TABLE IF EXISTS project_category CASCADE;
DROP TABLE IF EXISTS service_project CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS organization CASCADE;

-- Create organization table
CREATE TABLE IF NOT EXISTS organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    contact_email VARCHAR(255),
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create category table
CREATE TABLE IF NOT EXISTS category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create service_project table
CREATE TABLE IF NOT EXISTS service_project (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organization(organization_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organization(organization_id)
);

-- Create project_category junction table
CREATE TABLE IF NOT EXISTS project_category (
    project_id INTEGER NOT NULL REFERENCES service_project(project_id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES category(category_id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, category_id)
);

-- Insert default organizations
INSERT INTO organization (name, description, contact_email, phone_number) VALUES
('Community Health Clinic', 'Providing healthcare services to underserved communities.', 'info@communityhealthclinic.org', '(555) 123-4567'),
('Youth Education Initiative', 'Empowering youth through quality education and mentorship programs.', 'contact@youthed.org', '(555) 234-5678'),
('Environmental Conservation Society', 'Dedicated to protecting and preserving our natural environment.', 'info@ecoconservation.org', '(555) 345-6789');

-- Insert default categories
INSERT INTO category (name, description) VALUES
('Health & Wellness', 'Projects focused on health, medical care, and wellness initiatives'),
('Education & Mentorship', 'Educational programs, tutoring, and mentorship opportunities'),
('Environmental Cleanup', 'Environmental conservation, cleanup, and sustainability projects'),
('Community Support', 'General community assistance and support services'),
('Youth Development', 'Programs designed for youth growth and development');

-- Insert default service projects
INSERT INTO service_project (organization_id, name, description, start_date, end_date, status) VALUES
(1, 'Free Health Screening', 'Monthly free health screening and vaccination clinic for underserved communities', '2024-01-15', '2024-12-31', 'Active'),
(2, 'After-School Tutoring Program', 'One-on-one tutoring and homework help for students grades 3-8', '2024-02-01', '2024-06-30', 'Active'),
(3, 'River Cleanup Initiative', 'Monthly river cleanup and habitat restoration project', '2024-03-01', NULL, 'Active');

-- Link projects to categories
INSERT INTO project_category (project_id, category_id) VALUES
(1, 1), -- Free Health Screening -> Health & Wellness
(1, 4), -- Free Health Screening -> Community Support
(2, 2), -- After-School Tutoring -> Education & Mentorship
(2, 5), -- After-School Tutoring -> Youth Development
(3, 3), -- River Cleanup -> Environmental Cleanup
(3, 4); -- River Cleanup -> Community Support

-- Set database owner to elisha
ALTER TABLE organization OWNER TO elisha;
ALTER TABLE category OWNER TO elisha;
ALTER TABLE service_project OWNER TO elisha;
ALTER TABLE project_category OWNER TO elisha;

-- Session table for connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'session_pkey'
          AND conrelid = 'session'::regclass
    ) THEN
        ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
