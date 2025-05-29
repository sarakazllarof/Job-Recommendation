-- Add new columns to jobs table
ALTER TABLE jobs
ADD COLUMN employer_name VARCHAR(100),
ADD COLUMN employer_profile_url VARCHAR(255),
ADD COLUMN employer_profile_website VARCHAR(255),
ADD COLUMN employer_profile_logo VARCHAR(255),
ADD COLUMN location_name VARCHAR(100),
ADD COLUMN minimum_salary FLOAT,
ADD COLUMN maximum_salary FLOAT,
ADD COLUMN currency VARCHAR(10),
ADD COLUMN job_url VARCHAR(255),
ADD COLUMN applications INTEGER,
ADD COLUMN job_type VARCHAR(50),
ADD COLUMN reed_job_id INTEGER UNIQUE,
ADD COLUMN expiration_date DATETIME; 