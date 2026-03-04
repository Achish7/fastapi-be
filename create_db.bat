@echo off
set PGPASSWORD=admin123
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE guitar_store;"
