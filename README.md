# MyLinks Extension

Browser extension for the [MyLinks](https://github.com/my-links/my-links) project.

## Features

- **Retrieve collections**: Access and view your MyLinks collections
- **Retrieve favorites**: Sync and manage your bookmarks
- **Add links to collections**: Add links from any webpage to your collections

## Development

```bash
pnpm install
pnpm run dev:chrome
pnpm run dev:firefox
```

## Build

```bash
pnpm run build:chrome
pnpm run build:firefox
pnpm run build:all
```

Build artifacts are generated in `release/`.

## CI/CD

### CI

The `CI` workflow builds and tests the extension for:

- pull requests
- pushes to `main`
- tag pushes matching `v*`
- published GitHub releases
- manual runs (`workflow_dispatch`)

It builds Chrome and Firefox packages and uploads `release/*.zip` as workflow artifacts.

### Release

Release publishing is handled by the `publish` job inside the same `CI` workflow.

The `publish` job:

- depends on the `build` job (`needs: build`)
- only runs for:
  - manual runs (`workflow_dispatch`)
  - published GitHub releases
  - tag pushes starting with `v`

When it runs, it:

- uploads and publishes the Chrome build to the Chrome Web Store using the Web Store API
- signs/uploads the Firefox build to AMO using `web-ext sign --channel=listed`

### Required secrets

Set these secrets in your GitHub repository:

- **CHROME_EXTENSION_ID**
- **CHROME_CLIENT_ID**
- **CHROME_CLIENT_SECRET**
- **CHROME_REFRESH_TOKEN**
- **FIREFOX_ADDON_ID**
- **AMO_JWT_ISSUER**
- **AMO_JWT_SECRET**

`FIREFOX_ADDON_ID` is injected at build time into `browser_specific_settings.gecko.id`.

#### Chrome Web Store

- **CHROME_EXTENSION_ID**
  - Go to `https://chromewebstore.google.com` with the account that owns the extension.
  - Open the extension page in the Developer Dashboard.
  - Copy the ID from the URL (`.../detail/<name>/<extension_id>`).
- **CHROME_CLIENT_ID** and **CHROME_CLIENT_SECRET**
  - Go to `https://console.cloud.google.com/apis/credentials`.
  - Create a new project (or reuse an existing one).
  - Enable the **Chrome Web Store API** for this project.
  - Create OAuth credentials of type **Web application**.
  - In the OAuth client details, copy the **Client ID** and **Client Secret**.
- **CHROME_REFRESH_TOKEN**
  - Configure the OAuth consent screen for the project.
  - Use an OAuth helper (custom script or tool like `oauth2l`) to obtain a **refresh token** with the scope `https://www.googleapis.com/auth/chromewebstore`.
  - Store the resulting token in `CHROME_REFRESH_TOKEN`.

All these values must be added in GitHub under `Settings` → `Secrets and variables` → `Actions` → `New repository secret`.

#### Firefox Add-ons (AMO)

- **FIREFOX_ADDON_ID**
  - Go to `https://addons.mozilla.org/developers/addons`.
  - Open the extension page in the developer dashboard.
  - Copy the extension ID (or the `browser_specific_settings.gecko.id` you already use).
  - Set this exact value in `FIREFOX_ADDON_ID`.
- **AMO_JWT_ISSUER** and **AMO_JWT_SECRET**
  - Go to `https://addons.mozilla.org/developers/addons` with the developer account.
  - Open the **Tools** menu → **API keys** (or **Manage API keys**).
  - Generate a new **JWT API key**.
  - The **Issuer** becomes `AMO_JWT_ISSUER`, the **Secret** becomes `AMO_JWT_SECRET`.

Add these three secrets in GitHub the same way as for Chrome (`Settings` → `Secrets and variables` → `Actions`).
