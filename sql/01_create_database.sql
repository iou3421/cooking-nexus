CREATE DATABASE IF NOT EXISTS cooking_nexus
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'nexus_app'@'localhost'
  IDENTIFIED BY 'Pas3Word!';

GRANT SELECT, INSERT, UPDATE, DELETE
  ON cooking_nexus.*
  TO 'nexus_app'@'localhost';