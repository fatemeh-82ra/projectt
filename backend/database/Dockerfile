# Use the official PostgreSQL image from Docker Hub
#FROM postgres:latest
FROM postgres

# Set environment variables for PostgreSQL
ENV POSTGRES_PASSWORD=mypassword
ENV POSTGRES_USER=myuser
ENV POSTGRES_DB=mydatabase

# Expose the PostgreSQL port
EXPOSE 5432

# Create a volume for PostgreSQL data
VOLUME ["/var/lib/postgresql/data"]

# Add a health check to ensure the database is up and running
HEALTHCHECK --interval=30s --timeout=30s --retries=3 \
  CMD pg_isready -U $POSTGRES_USER || exit 1
