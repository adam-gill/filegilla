# filegilla

## secure and private cloud storage

## to build a local production instance, run the following commands

```bash

git clone <repo-url>
cd filegilla

vim .env # see .env example  for what to put in .env file 

docker compose build
docker compose up
# TODO - need to setup database tables for everything to work

```

## .env example

```env

# Better Auth

BETTER_AUTH_URL=
BETTER_AUTH_SECRET=

# Database

POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=

# OAuth

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# AWS

S3_ACCESS_ROLE_ARN=
S3_BUCKET_NAME=
S3_PUBLIC_BUCKET_NAME=
S3_PUBLIC_BUCKET_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=

# Misc

NEXT_PUBLIC_APP_URL=
NODE_ENV=
RESEND_API_KEY=

```



## future roadmap
- fix preview images for large videos (old process part of the video to speed it up)
- add preview images for text files, filegilla documents, and files that can be displayed in plain text (like code files - index.js)
- revamp filegilla documents, they kinda suck
- add feature to select multiple items to move/delete (two separate things probably)
- url shortener
- maybe some text dump feature (so you can curl filegilla.com/dump/your_dump_name and get that text). filegilla documents need js to load in.