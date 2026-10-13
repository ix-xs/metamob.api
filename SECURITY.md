# Security policy

## Supported versions

The latest `5.x` release on npm receives security fixes.

| Version | Supported |
| --- | --- |
| 5.x | yes |
| 4.x and older | no |

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report privately through GitHub's [security advisories](https://github.com/ix-xs/metamob.api/security/advisories/new),
or email **contact@ix-xs.dev**. Include a description, the affected versions, and a
minimal reproduction if possible.

You will get an acknowledgement, and a fix will be released as promptly as the
severity warrants, with credit unless you prefer to remain anonymous.

## What the library does with your API key

- The key is sent in the `Authorization` header, never in a URL, and only to
  `www.metamob.fr`, unless you point `baseUrl` somewhere else: the key then
  goes to that host.
- Errors and events carry the URL of the request, which never contains the
  key.
- Nothing is written to disk. The cache lives in memory unless you plug in
  your own store, and entries tied to an account are filed under a SHA-256
  digest of the key, not under the key itself.
- A key gives full access to the quests and private messages of its owner.
  When players hand you theirs, store it like a password, and let them revoke
  it on metamob.fr (Settings > API key).
