# filegilla

## secure and private cloud storage

## to build a local production instance, run the following commands

```bash

git clone <repo-url>
cd filegilla
docker build -t filegilla:latest .
docker run -p 3000:3000 --env-file .env filegilla:latest
```

## future roadmap
- fix preview images for large videos (old process part of the video to speed it up)
- add preview images for text files, filegilla documents, and files that can be displayed in plain text (like code files - index.js)
- revamp filegilla documents, they kinda suck
- add feature to select multiple items to move/delete (two separate things probably)
- url shortener
- maybe some text dump feature (so you can curl filegilla.com/dump/your_dump_name and get that text). filegilla documents need js to load in.