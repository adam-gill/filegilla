# filegilla

## secure and private cloud storage

## to build a local production instance, run the following commands

```bash

git clone <repo-url>
cd filegilla

vim .env # see .env example  for what to put in .env file 

docker compose build
docker compose up -d

# to view logs of the web and db container
docker compose logs -f 

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
- search feature (search recursively through subdirectories). Search file/folder name title with fuzzy search and possibly search through text of fb docs
- add preview images for text files, filegilla documents, and files that can be displayed in plain text (like code files - index.js)
- revamp filegilla documents, they kinda suck
- add feature to select multiple items to move/delete (two separate things probably)
- url shortener (server actions only, at least for text sharing so that i can put something on filegilla then curl it on my server)
- integrate yt-dlp/cobalt with uploading button (enter url to download content which is then uploaded to filegilla)
- migrate from cloudflared tunnels to ngnix
- make fg api/cli upload to users' folders or a public space
    - try to reuse the other uploading/sharing features, and would also have to incorporate file preview generation
    - text uploads will stay in the db and have to be user scoped instead of global
    - only view text via cli or api unless i want to render in the text into an fg document that the user can mess with, this would require more work for little benefit
