-- Add viewed and applied columns to recommendations table
ALTER TABLE recommendations
ADD COLUMN viewed BOOLEAN DEFAULT FALSE,
ADD COLUMN applied BOOLEAN DEFAULT FALSE; 