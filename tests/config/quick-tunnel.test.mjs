import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, '../..');

async function projectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), 'utf8');
}

function composeServiceBlock(compose, serviceName) {
  const lines = compose.split(/\r?\n/);
  const start = lines.findIndex((line) => line === `  ${serviceName}:`);
  assert.notEqual(start, -1, `Missing Compose service: ${serviceName}`);

  const next = lines.findIndex((line, index) => index > start && /^  [a-zA-Z0-9_-]+:$/.test(line));
  return lines.slice(start, next === -1 ? lines.length : next).join('\n');
}

test('Quick Tunnel Compose is outbound-only and pinned', async () => {
  const compose = await projectFile('compose.quick-tunnel.yaml');

  assert.match(compose, /cloudflare\/cloudflared:2026\.10\.7/);
  assert.match(compose, /http:\/\/caddy:8080/);
  assert.match(compose, /Caddyfile\.quick-tunnel/);

  const wordpress = composeServiceBlock(compose, 'wordpress');
  const wpcli = composeServiceBlock(compose, 'wpcli');
  const caddy = composeServiceBlock(compose, 'caddy');
  const cloudflared = composeServiceBlock(compose, 'cloudflared');

  assert.match(
    wordpress,
    /WP_HOME: \$\{PUBLIC_URL:\?Set PUBLIC_URL in the Quick Tunnel environment file\}[\s\S]*?WP_SITEURL: \$\{PUBLIC_URL:\?Set PUBLIC_URL in the Quick Tunnel environment file\}/,
  );
  assert.match(
    wpcli,
    /WP_HOME: \$\{PUBLIC_URL:\?Set PUBLIC_URL in the Quick Tunnel environment file\}[\s\S]*?WP_SITEURL: \$\{PUBLIC_URL:\?Set PUBLIC_URL in the Quick Tunnel environment file\}/,
  );
  assert.match(caddy, /cap_drop:\s*\n\s*- ALL\s*\n\s*cap_add:\s*\n\s*- NET_BIND_SERVICE/);
  assert.match(cloudflared, /restart: "no"/);
  assert.doesNotMatch(compose, /^\s+ports:/m);
  assert.doesNotMatch(compose, /network_mode:\s*host/);
});

test('Quick Tunnel edge exposes the authenticated WordPress admin entry point', async () => {
  const caddyfile = await projectFile('docker/caddy/Caddyfile.quick-tunnel');
  const deploy = await projectFile('scripts/deploy-quick-tunnel.sh');

  assert.doesNotMatch(caddyfile, /blocked_admin|\/wp-login\.php|\/wp-admin/);
  assert.match(caddyfile, /header_up X-Forwarded-Proto "https"/);
  assert.match(caddyfile, /@health path \/__avtozakup_health/);
  assert.match(deploy, /check_public_admin_route \/wp-login\.php/);
  assert.match(deploy, /check_public_admin_route \/wp-admin\//);
  assert.match(deploy, /id="loginform"/);
  assert.match(deploy, /Configured bootstrap credentials remain only in/);
});

test('deployment guardrails preserve foreign services', async () => {
  const deploy = await projectFile('scripts/deploy-quick-tunnel.sh');

  assert.match(deploy, /EXISTING_SITE_URLS must contain exactly two/);
  assert.match(deploy, /EXPECTED_SERVER_IP is required/);
  assert.match(deploy, /snapshot_foreign_containers/);
  assert.match(deploy, /docker ps -aq --no-trunc > "\$STATE_DIR\/containers\.before\.ids" \|\| fail/);
  assert.match(deploy, /RestartCount/);
  assert.match(deploy, /logs --no-color --tail 80 "\$service"/);
  assert.match(deploy, /Listeners on host ports 80\/443 changed/);
  assert.match(deploy, /avtozakup-quick-tunnel\.lock/);
  assert.match(deploy, /docker volume inspect avtozakup_db_data/);
  assert.match(deploy, /run --rm -T --no-deps --entrypoint sh wpcli/);
  assert.match(deploy, /stop caddy >\/dev\/null/);
  assert.doesNotMatch(deploy, /stop caddy[^\n]*\|\| true/);
  assert.ok(
    deploy.indexOf('Running the idempotent WordPress bootstrap.')
      < deploy.indexOf('Recreating only the project Caddy container after bootstrap'),
    'The public project proxy must start only after bootstrap succeeds.',
  );
  assert.doesNotMatch(deploy, /docker\s+compose[^\n]*(?:down|--remove-orphans)/);
  assert.doesNotMatch(deploy, /docker\s+(?:system\s+)?prune/);
  assert.doesNotMatch(deploy, /done < <\(docker ps/);
});

test('one-command installer is fixed to the intended repository and branch', async () => {
  const installer = await projectFile('scripts/install-quick-tunnel.sh');

  assert.match(installer, /https:\/\/github\.com\/Slavko13\/assiriya\.git/);
  assert.match(installer, /DEPLOY_BRANCH="main"/);
  assert.match(installer, /pull --ff-only/);
  assert.match(installer, /avtozakup-quick-tunnel-install\.lock/);
  assert.match(installer, /"\$INSTALL_DIR\/scripts\/deploy-quick-tunnel\.sh"/);
});
