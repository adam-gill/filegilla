# filegilla CLI API

A simple HTTP API for uploading and retrieving small text snippets and files.
You talk to it with `curl`, `wget`, or anything that can make HTTP requests.

The base URL is your filegilla instance, e.g. `http://localhost:3000`.

## Authentication

Every request must include two headers:

| Header        | Value                                                |
| ------------- | ---------------------------------------------------- |
| `x-api-key`   | The API key **secret** (the plaintext string).       |
| `x-api-key-id`| The API key **id** (the UUID, with or without this header — see below). |

If you omit `x-api-key-id`, the server falls back to a built-in default
(`cb7c658b-2660-4d9c-ad22-b5dda0875d53`). For most users you only need to
send `x-api-key`. For multi-key setups, send both.

Example:

```bash
curl http://localhost:3000/cli \
  -H "x-api-key: sk_live_abc123..." \
  -H "x-api-key-id: cb7c658b-2660-4d9c-ad22-b5dda0875d53"
```

## Authorization

In addition to authenticating the API key, every per-item operation
(`GET /cli/{id}`, `DELETE /cli/{id}`) checks that the authenticated user
**owns** the item. The `cliItem` row has an `ownerId` column that links to
`"user".id`; if the owner doesn't match the API key's user, the request is
rejected with `403 Forbidden`.

This means:

- You can only retrieve or delete items you uploaded.
- Other users with valid API keys still cannot read or delete your items.
- Item IDs are unique **across all users** (the `id` column is the primary
  key), so two users cannot pick the same `id` — the second one gets a
  `409 Conflict` on upload.

## Endpoints

### `POST /cli` — upload a text snippet or a file

Always `multipart/form-data`. The server accepts either a `file` part or a
`text` part, never both.

#### Form fields

| Field       | Required           | Type     | Description                                                                                                  |
| ----------- | ------------------ | -------- | ------------------------------------------------------------------------------------------------------------ |
| `file`      | one of `file`/`text` | binary  | The file to upload. Sent as a `multipart/form-data` file part.                                               |
| `text`      | one of `file`/`text` | string  | A text snippet to upload. Sent as a regular form field.                                                     |
| `id`        | optional           | string   | The ID to store this item under. Must be unique across all `cliItem`s (any user). If omitted, a random 10-char ID is generated. |
| `key`       | optional           | string   | A password used to **encrypt the `text` value** before it is stored. Only used for text uploads. See [Encryption](#encryption). |
| `overwrite` | optional           | string   | For file uploads only. Set to `"true"` to overwrite an existing file with the same name in your S3 namespace. Anything else (including omitting it) means "fail with 409 if it exists." |

#### File upload example

```bash
curl -X POST http://localhost:3000/cli \
  -H "x-api-key: sk_live_abc123..." \
  -F "file=@./hello.txt" \
  -F "id=my-hello"
```

Response (200):

```json
{
  "success": true,
  "message": "Successfully uploaded file, download it with a GET request to http://localhost:3000/cli/my-hello"
}
```

#### File upload with overwrite

```bash
curl -X POST http://localhost:3000/cli \
  -H "x-api-key: sk_live_abc123..." \
  -F "file=@./hello.txt" \
  -F "id=my-hello" \
  -F "overwrite=true"
```

#### Text upload

```bash
curl -X POST http://localhost:3000/cli \
  -H "x-api-key: sk_live_abc123..." \
  -F "text=hello world" \
  -F "id=greeting"
```

#### Text upload, server-side encrypted

The `text` is encrypted with `key` (PBKDF2 + AES-GCM) before it is stored. The
server never stores the plaintext. To read it back, pass the same `key` as a
query parameter on the GET request (see below).

```bash
curl -X POST http://localhost:3000/cli \
  -H "x-api-key: sk_live_abc123..." \
  -F "text=super secret note" \
  -F "id=note1" \
  -F "key=my-strong-password"
```

The response is the same shape as a normal text upload.

#### Auto-generated ID

Omit `id` to let the server pick one. The generated ID is **not** in the
response, so if you need it later you should provide your own.

```bash
curl -X POST http://localhost:3000/cli \
  -H "x-api-key: sk_live_abc123..." \
  -F "text=hello"
# Server replies with a success message including the URL, e.g.
# "...GET request to http://localhost:3000/cli/aBcD3fGhJk"
# — the ID is in the URL.
```

#### Response status codes

| Status | Meaning                                                                                            |
| ------ | -------------------------------------------------------------------------------------------------- |
| `200`  | Upload succeeded.                                                                                  |
| `400`  | Bad request — both `file` and `text` were sent, or neither was sent, or encryption failed.         |
| `401`  | Unauthorized — missing or invalid `x-api-key`.                                                     |
| `409`  | Conflict — the `id` is already in use, or a file with the same name exists and `overwrite` is not `"true"`. |
| `500`  | Server error — the upload was rolled back. The previous state is preserved.                        |

### `GET /cli/{id}` — retrieve an item

Fetch a previously-uploaded text or file. The `id` is the value you supplied
(or the one the server generated) at upload time.

```bash
curl http://localhost:3000/cli/my-hello \
  -H "x-api-key: sk_live_abc123..."
```

Behavior depends on what the item is:

- **Text item (`isFile = false`)**: the response body is the stored
  `content`. If the item was uploaded with `key` (encrypted), pass the same
  `key` as a query parameter to decrypt on the way out:

  ```bash
  # Plaintext item
  curl http://localhost:3000/cli/note1 \
    -H "x-api-key: sk_live_abc123..."

  # Encrypted item, with the right key
  curl "http://localhost:3000/cli/note1?key=my-strong-password" \
    -H "x-api-key: sk_live_abc123..."

  # Encrypted item, without the key (or with the wrong key)
  curl "http://localhost:3000/cli/note1" \
    -H "x-api-key: sk_live_abc123..."
  # → returns the raw base64 ciphertext blob as text/plain
  ```

  A wrong `key` produces `400` with an `OPERATION_FAILED` error.

- **File item (`isFile = true`)**: the server streams the file from the
  public S3 bucket. The response includes:

  - `Content-Type` from the S3 object (or `application/octet-stream` if S3
    didn't store one).
  - `Content-Disposition: attachment; filename="..."` so browsers and `curl
    -OJ` save with the original filename.
  - `Content-Length` if S3 reported it.

  Use `curl -OJ` to save the file locally with the server-supplied name:

  ```bash
  curl -OJ http://localhost:3000/cli/my-hello \
    -H "x-api-key: sk_live_abc123..."
  # → saves to ./hello (or whatever the original filename was)
  ```

#### Response status codes

| Status | Meaning                                                                                            |
| ------ | -------------------------------------------------------------------------------------------------- |
| `200`  | Success. Body is the text content or the file stream.                                               |
| `400`  | Bad request — wrong `key` for a decrypt-on-read.                                                   |
| `401`  | Unauthorized — missing or invalid `x-api-key`.                                                     |
| `403`  | Forbidden — the item exists but is owned by a different user.                                       |
| `404`  | Not found — no `cliItem` with that `id`, or (for file items) the DB row exists but the S3 object is missing. |
| `500`  | Server error — fetch failed.                                                                       |

### `DELETE /cli/{id}` — delete an item

Remove a `cliItem` you own. For text items, the database row is deleted.
For file items, both the S3 object and the database row are deleted.

```bash
curl -X DELETE http://localhost:3000/cli/my-hello \
  -H "x-api-key: sk_live_abc123..."
```

Response (200):

```json
{
  "success": true,
  "message": "Successfully deleted cliItem."
}
```

#### Deletion order

For file items, the S3 object is deleted first. If the S3 delete fails, the
database row is left intact and the response is `500` — you can retry. If
the S3 delete succeeds but the database delete fails, the S3 object is
already gone; the database row is now orphaned (its `content` points to a
non-existent S3 key). This is a degraded state but not catastrophic.

For text items, the database row is deleted directly. No S3 involved.

The S3 delete is idempotent — if the object was already gone (for example,
because of a previous failed attempt that succeeded on S3 but failed on DB),
the delete call still returns success and the DB cleanup proceeds normally.

#### Response status codes

| Status | Meaning                                                                                            |
| ------ | -------------------------------------------------------------------------------------------------- |
| `200`  | Deleted.                                                                                            |
| `401`  | Unauthorized — missing or invalid `x-api-key`.                                                     |
| `403`  | Forbidden — the item exists but is owned by a different user.                                       |
| `404`  | Not found — no `cliItem` with that `id`.                                                           |
| `500`  | Server error — S3 delete failed (DB row preserved) or DB delete failed (S3 object already gone).   |

## Encryption

For text uploads only: if you supply `key` on POST, the server encrypts the
text with PBKDF2-SHA256 (600,000 iterations) → AES-256-GCM and stores the
ciphertext. The output is a base64 blob that contains the salt, IV, and
ciphertext concatenated. The server never sees your plaintext or your key.

To decrypt on read, pass the same `key` as a query parameter on GET:
`/cli/{id}?key=...`. Without the right `key`, GET returns the raw base64
ciphertext as `text/plain` (not an error) — this lets clients decrypt
client-side if they want, but it's not a useful response in a browser.

This is the server-side `key` parameter. It is **not** the same as any
client-side encryption you might do yourself before uploading. If you want
end-to-end encryption, encrypt the file yourself before sending it and upload
the ciphertext as a `file`.

## Notes and gotchas

- `id` is the lookup key. If you want to retrieve an item later, supply a
  predictable `id` (or capture the URL from the success message).
- File uploads are stored in S3 under `cli/{userId}/{filename}`. The
  filename in S3 is the original filename from your `file` part, not the
  `id`. The `id` only indexes the `cliItem` row in Postgres; the row's
  `content` column holds the S3 key. The `Content-Disposition` filename on
  GET is derived from the last segment of that S3 key.
- `overwrite` is matched against the literal string `"true"`. `True`, `1`,
  `yes` all mean "do not overwrite."
- The same `id` cannot be reused for a text item and a file item. The
  uniqueness check is on `id` alone, and it's global across all users.
- The server assumes a single S3 bucket for files. There is no per-folder
  or per-bucket routing.
- Auth is checked before authorization, which is checked before any data
  fetch or mutation. A request without a valid API key never reaches S3 or
  the database beyond the `apiKey` lookup.
- File downloads are streamed from S3 through the Node server to the
  client. For very large files this means a long-lived connection; the
  client can use `curl` with `-O` to write to disk as bytes arrive.
- For very large files (multi-GB), the upload limit is `5gb` (configured in
  `next.config.mjs`). Bigger files will fail with a request-body error.
