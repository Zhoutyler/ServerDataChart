DROP DATABASE IF EXISTS Cylera;
CREATE DATABASE Cylera;
USE DATABASE Cylera;
CREATE TABLE ServerData (
        device_id VARCHAR(128) PRIMARY KEY,
        timestamp DATE,
        bytes_ts INT,
        bytes_fs INT
);