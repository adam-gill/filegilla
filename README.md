# filegilla

## secure and private cloud storage

## to build a local production instance, run the following commands

```bash

git clone <repo-url>
cd filegilla

vim .env # see .env example  for what to put in .env file 

docker compose build
docker compose up -d
# TODO - need to setup database tables for everything to work

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
- search feature (search recursively through subdirectories). Search file/folder name title with fuzzy search and possibly search through text of gb docs) 
- add preview images for text files, filegilla documents, and files that can be displayed in plain text (like code files - index.js)
- revamp filegilla documents, they kinda suck
- add feature to select multiple items to move/delete (two separate things probably)
- url shortener (server actions only, at least for text sharing so that i can put something on filegilla then curl it on my server)
- maybe some text dump feature (so you can curl filegilla.com/dump/your_dump_name and get that text). filegilla documents need js to load in.
- redo pdf render to use react-pdf and pdfjs
- next/previous post button, page location rememberer, and link uploads
- when copying file, it uses the same image preview, and if you delete the copied file, it deletes the image preview from the original file
- integrate yt-dlp/cobalt with uploading button (enter url to download content which is then uploaded to filegilla)
