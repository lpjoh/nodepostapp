drop database if exists nodepostapp;
create database nodepostapp;
use nodepostapp;

create table account (
    id int primary key auto_increment,
    username varchar(255) not null unique,
    password varchar(255) not null
);