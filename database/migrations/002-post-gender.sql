ALTER TABLE posts
  ADD COLUMN gender ENUM('male','female','any') NOT NULL DEFAULT 'any' AFTER district;