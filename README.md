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
- fix preview images for large videos (old process part of the video to speed it up)
    - Changed the process to: 
        - do regular s3 upload on client
        - call api that pulls down s3 object on server and processes the file for preview image generation
        - api sends a response back
        - caveat: if user disconnects after s3 upload and before preview image processes, the preview image job does not finish and there is no preview image generated
        - solution: nextjs api feature that sends instant response and processes job if client disconnects, just will have to poll and probably write a new api route to check if the preview image is generated or not
    - Also, the share process is still pretty bad, it needs redone
    - Need to add additional step on deleteItem that deletes the shared object from the share bucket with its preview image that is also on the public bucket
    - Given you want minimal AWS, here's the honest simplest version:
        - Client uploads directly to S3 via presigned URL (already done)
        - After upload completes on the client, call a Next.js server action to queue the preview job — just insert a row into a preview_jobs DB table with status: "pending" and the S3 key
        - A background worker loop in your Next.js app (a simple setInterval or cron route) picks up pending jobs, streams only the first 20MB from S3 with a range request, runs ffmpeg/ImageMagick/Ghostscript, uploads the preview, and marks the job done
        - Your UI shows a skeleton/file-type icon for pending files — same as Google Drive does
- add preview images for text files, filegilla documents, and files that can be displayed in plain text (like code files - index.js)
- revamp filegilla documents, they kinda suck
- add feature to select multiple items to move/delete (two separate things probably)
- url shortener (server actions only, at least for text sharing so that i can put something on filegilla then curl it on my server)
- maybe some text dump feature (so you can curl filegilla.com/dump/your_dump_name and get that text). filegilla documents need js to load in.
- redo pdf render to use react-pdf and pdfjs