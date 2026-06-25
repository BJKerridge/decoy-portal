FROM postgres:16-alpine

# Create a dedicated internal backups folder
RUN mkdir -p /backups && chown postgres:postgres /backups

# Copy initialization scripts into the target runtime entrypoint folder
COPY ./init/*.sql /docker-entrypoint-initdb.d/

EXPOSE 5432