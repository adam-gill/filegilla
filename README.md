# filegilla

## secure and private cloud storage

## to build a local production instance, run the following commands

```bash

git clone <repo-url>
cd filegilla
docker build -t filegilla:latest .
docker run -p 3000:3000 --env-file .env filegilla:latest
```