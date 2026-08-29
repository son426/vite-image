# Releasing @son426/vite-image

## One-time trusted publisher setup

Configure the package on npmjs.com with this GitHub Actions trusted publisher:

- Organization or user: `son426`
- Repository: `vite-image`
- Workflow filename: `release.yml`
- Allowed action: `npm publish`

Do not add a long-lived npm token to GitHub. The workflow uses GitHub OIDC on a
GitHub-hosted runner, and npm generates provenance automatically.

The npm setting lives under **Package settings → Trusted publishing**. The
[official npm guide](https://docs.npmjs.com/trusted-publishers/) documents the
same fields and current runtime requirements.

## Prepare the release commit

1. Replace `Unreleased` in `CHANGELOG.md` with the release date.
2. Confirm `package.json` contains the intended version.
3. Run `pnpm install --frozen-lockfile`.
4. Run `pnpm release:check`.
5. Run `npm publish --dry-run --ignore-scripts --access public` to inspect the
   final registry operation without repeating the lifecycle gate.
6. Push the clean release commit to `main` and wait for CI to pass.

## Publish

1. Create an annotated `v<package version>` tag on the verified `main` commit.
2. Push the tag to GitHub.
3. Dispatch the `npm release` workflow at that tag. For example:

   ```sh
   gh workflow run release.yml --ref v1.0.1
   ```

   The workflow rejects branch refs, mismatched versions, commits outside
   `main`, and versions that already exist on npm.
4. Confirm `npm view @son426/vite-image version` reports the new version and the
   package page shows provenance.
5. Deprecate old releases with a message that directs users to v1:

   ```sh
   npm deprecate '@son426/vite-image@<1.0.1' 'Unsupported: upgrade to @son426/vite-image@^1.0.1 for patched Vite peers, React 18 SSR, and image decoder security fixes.'
   ```

6. Create the GitHub Release from the same tag using the matching changelog
   section.
7. After the first trusted publish succeeds, set npm publishing access to
   **Require two-factor authentication and disallow tokens**. Trusted publishing
   continues to work without a long-lived token.

## Deploy and verify the demo

Deploy only after npm `latest` points to the new version, so the live install
command and package API cannot disagree.

```sh
pnpm --dir demo build
cd demo
firebase deploy --project vite-image --only hosting
```

Open <https://vite-image.web.app>, verify the v1 heading and quick start, and
confirm the optimized image reports AVIF or WebP candidates with no console errors.
