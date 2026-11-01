const ADMIN_WRITE_ENV = ['WP_ADMIN_USER', 'WP_ADMIN_PASSWORD', 'E2E_ALLOW_ADMIN_WRITES'];

function owns(environment, name) {
  return Object.prototype.hasOwnProperty.call(environment, name);
}

function hasValue(value) {
  return typeof value === 'string' && value.length > 0;
}

export function validatePlaywrightEnvironment(environment = process.env) {
  const rawBaseURL = environment.BASE_URL?.trim();
  if (!rawBaseURL) {
    throw new Error('[Playwright preflight] BASE_URL is required; no implicit target is allowed.');
  }

  let parsedBaseURL;
  try {
    parsedBaseURL = new URL(rawBaseURL);
  } catch {
    throw new Error('[Playwright preflight] BASE_URL must be a valid absolute http(s) URL.');
  }

  if (!['http:', 'https:'].includes(parsedBaseURL.protocol) || !parsedBaseURL.hostname) {
    throw new Error('[Playwright preflight] BASE_URL must use http or https and include a hostname.');
  }

  if (parsedBaseURL.username || parsedBaseURL.password) {
    throw new Error('[Playwright preflight] BASE_URL must not contain credentials.');
  }

  if (parsedBaseURL.search || parsedBaseURL.hash) {
    throw new Error('[Playwright preflight] BASE_URL must not contain a query string or fragment.');
  }

  if (parsedBaseURL.pathname !== '/') {
    throw new Error('[Playwright preflight] BASE_URL must target the origin root because the suite uses root-relative routes.');
  }

  const hasAdminSignal = ADMIN_WRITE_ENV.some((name) => owns(environment, name));
  const adminWritesEnabled = hasValue(environment.WP_ADMIN_USER)
    && hasValue(environment.WP_ADMIN_PASSWORD)
    && environment.E2E_ALLOW_ADMIN_WRITES === '1';

  if (hasAdminSignal && !adminWritesEnabled) {
    throw new Error(
      '[Playwright preflight] Mutable admin E2E requires WP_ADMIN_USER, WP_ADMIN_PASSWORD, '
      + 'and E2E_ALLOW_ADMIN_WRITES=1 together; preflight errors never include supplied values.',
    );
  }

  return {
    baseURL: parsedBaseURL.toString(),
    adminWritesEnabled,
  };
}
