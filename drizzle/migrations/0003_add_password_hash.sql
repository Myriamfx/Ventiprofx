-- add passwordHash column to support email/password authentication
ALTER TABLE users
  ADD COLUMN passwordHash varchar(256) DEFAULT NULL;
