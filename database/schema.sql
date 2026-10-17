DROP DATABASE IF EXISTS studshare;
CREATE DATABASE studshare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE studshare;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pending_registrations (
  email VARCHAR(120) PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  code_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts TINYINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Анкета: sleep/cleanliness/noise 1..5, smoking 1..3. Усе необов'язкове.
CREATE TABLE profiles (
  user_id INT PRIMARY KEY,
  sleep TINYINT NULL,
  cleanliness TINYINT NULL,
  noise TINYINT NULL,
  smoking TINYINT NULL,
  budget_min INT NULL,
  budget_max INT NULL,
  bio TEXT NULL,
  bio_embedding JSON NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('has_housing', 'seeking') NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  price INT NOT NULL,
  district VARCHAR(50) NOT NULL,
  address VARCHAR(255) NULL,
  lat DOUBLE NULL,
  lng DOUBLE NULL,
  contact VARCHAR(100) NOT NULL,
  status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_feed (type, status, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE favorites (
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);