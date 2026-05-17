-- Drop tables if they exist
DROP TABLE IF EXISTS project_category CASCADE;
DROP TABLE IF EXISTS service_project CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS organization CASCADE;

-- Create organization table
CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    contact_email VARCHAR(255),
    phone_number VARCHAR(20),
    logo_filename VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create category table
CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create service_project table
CREATE TABLE service_project (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organization(organization_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE,
    location VARCHAR(255),
    title VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organization(organization_id)
);

-- Create project_category junction table
CREATE TABLE project_category (
    project_id INTEGER NOT NULL REFERENCES service_project(project_id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES category(category_id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, category_id)
);

-- Insert default organizations
INSERT INTO organization (name, description, contact_email, phone_number, logo_filename) VALUES
('Community Health Clinic', 'Providing healthcare services to underserved communities.', 'info@communityhealthclinic.org', '(555) 123-4567', 'brightfuture-logo.png'),
('Youth Education Initiative', 'Empowering youth through quality education and mentorship programs.', 'contact@youthed.org', '(555) 234-5678', 'greenharvest-logo.png'),
('Environmental Conservation Society', 'Dedicated to protecting and preserving our natural environment.', 'info@ecoconservation.org', '(555) 345-6789', 'unityserve-logo.png'),
('Bright Future Foundation', 'Supporting underserved communities through education and wellness.', 'contact@brightfuture.org', '(555) 456-7890', 'brightfuture-logo.png'),
('Green Harvest Initiative', 'Growing sustainable food systems and community gardens.', 'info@greenharvest.org', '(555) 567-8901', 'greenharvest-logo.png'),
('Unity Serve Network', 'Connecting volunteers with community service opportunities.', 'hello@unityserve.org', '(555) 678-9012', 'unityserve-logo.png');

-- Insert default categories
INSERT INTO category (name, description) VALUES
('Health & Wellness', 'Projects focused on health, medical care, and wellness initiatives'),
('Education & Mentorship', 'Educational programs, tutoring, and mentorship opportunities'),
('Environmental Cleanup', 'Environmental conservation, cleanup, and sustainability projects'),
('Community Support', 'General community assistance and support services'),
('Youth Development', 'Programs designed for youth growth and development');

-- Insert default service projects (15 total)
INSERT INTO service_project (organization_id, name, title, description, date, location, status) VALUES
(1, 'Free Health Screening', 'Free Health Screening', 'Monthly free health screening and vaccination clinic for underserved communities', '2026-05-20', 'Community Health Center Downtown', 'Active'),
(2, 'After-School Tutoring Program', 'Senior Center Social Hour', 'One-on-one tutoring and homework help for students grades 3-8', '2026-05-22', 'Silver Linings Home', 'Active'),
(3, 'River Cleanup Initiative', 'River Cleanup Initiative', 'Monthly river cleanup and habitat restoration project', '2026-05-25', 'Riverfront Park', 'Active'),
(1, 'Urban Seed Planting', 'Urban Seed Planting', 'Sowing spring vegetables in the neighborhood alleyway patches', '2026-05-20', 'Community Garden Lot B', 'Active'),
(2, 'Youth Mentorship Day', 'Youth Mentorship Day', 'Connect with local students for academic and personal growth guidance', '2026-05-23', 'Central Library Meeting Rooms', 'Active'),
(3, 'Tree Planting Drive', 'Tree Planting Drive', 'Plant native trees to restore local forest canopy and improve air quality', '2026-05-26', 'Urban Forest Reserve', 'Active'),
(4, 'Wellness Workshop Series', 'Wellness Workshop Series', 'Free fitness and nutrition classes for all community members', '2026-05-21', 'Recreation Center', 'Active'),
(5, 'Food Bank Packaging', 'Food Bank Packaging', 'Help sort and package fresh produce for local food distribution', '2026-05-24', 'Community Food Pantry', 'Active'),
(6, 'Tech Skills Training', 'Tech Skills Training', 'Teach basic computer and digital literacy to seniors', '2026-05-27', 'Public Library Computer Lab', 'Active'),
(1, 'Park Beautification', 'Park Beautification', 'Landscape improvements and maintenance at neighborhood parks', '2026-05-19', 'Central Park', 'Active'),
(2, 'Reading Buddy Program', 'Reading Buddy Program', 'One-on-one reading sessions with elementary school children', '2026-05-22', 'Elementary School Library', 'Active'),
(3, 'Watershed Protection', 'Watershed Protection', 'Monitor water quality and remove invasive species from local streams', '2026-05-28', 'Mill Creek', 'Active'),
(4, 'Community Health Fair', 'Community Health Fair', 'Provide free health screenings and wellness information', '2026-05-25', 'Community Center Courtyard', 'Active'),
(5, 'Urban Garden Workshop', 'Urban Garden Workshop', 'Teach sustainable gardening techniques for small spaces', '2026-05-23', 'Rooftop Garden', 'Active'),
(6, 'Volunteer Appreciation Event', 'Volunteer Appreciation Event', 'Celebrate and recognize service volunteers in the community', '2026-05-29', 'Community Fellowship Hall', 'Active');

-- Link projects to categories
INSERT INTO project_category (project_id, category_id) VALUES
(1, 1), -- Free Health Screening -> Health & Wellness
(1, 4), -- Free Health Screening -> Community Support
(2, 2), -- After-School Tutoring -> Education & Mentorship
(2, 5), -- After-School Tutoring -> Youth Development
(3, 3), -- River Cleanup -> Environmental Cleanup
(3, 4), -- River Cleanup -> Community Support
(4, 4), -- Urban Seed Planting -> Community Support
(5, 2), -- Youth Mentorship Day -> Education & Mentorship
(5, 5), -- Youth Mentorship Day -> Youth Development
(6, 3), -- Tree Planting Drive -> Environmental Cleanup
(7, 1), -- Wellness Workshop -> Health & Wellness
(8, 4), -- Food Bank Packaging -> Community Support
(9, 2), -- Tech Skills Training -> Education & Mentorship
(10, 4), -- Park Beautification -> Community Support
(11, 2), -- Reading Buddy Program -> Education & Mentorship
(11, 5), -- Reading Buddy Program -> Youth Development
(12, 3), -- Watershed Protection -> Environmental Cleanup
(13, 1), -- Community Health Fair -> Health & Wellness
(13, 4), -- Community Health Fair -> Community Support
(14, 4), -- Urban Garden Workshop -> Community Support
(15, 2), -- Volunteer Appreciation -> Education & Mentorship
(15, 4); -- Volunteer Appreciation -> Community Support

-- Set database owner to elisha
ALTER TABLE organization OWNER TO elisha;
ALTER TABLE category OWNER TO elisha;
ALTER TABLE service_project OWNER TO elisha;
ALTER TABLE project_category OWNER TO elisha;
