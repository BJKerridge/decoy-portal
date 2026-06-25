# DECOY PORTAL

### Running Containers

Local/Testing:
`docker compose up -d`

[UI Layer](http://localhost:3000/)

[Orch Layer](http://localhost:3001)

[Grafana/Logging](http://localhost:4000/)

[Adminer/DB Testing](http://localhost:5050/)

Production:
`docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`