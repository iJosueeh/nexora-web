import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = process.cwd();
const envPath = resolve(rootDir, '.env');
const environmentPath = resolve(rootDir, 'src/environments/environment.generated.ts');
const environmentProdPath = resolve(rootDir, 'src/environments/environment.generated.prod.ts');

const hardcodedDefaults = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',
  graphqlUrl: 'http://localhost:8080/graphql',
  supabaseUrl: '',
  supabaseAnonKey: '',
};

const processEnvEntries = {
  API_BASE_URL: process.env.API_BASE_URL,
  GRAPHQL_URL: process.env.GRAPHQL_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
};

function parseEnv(content) {
  const entries = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator < 0) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    entries[key] = value;
  }

  return entries;
}

function looksLikeSecretKey(value) {
  if (typeof value !== 'string') return false;

  const normalized = value.trim().toLowerCase();
  return normalized.startsWith('sb_secret_')
    || normalized.includes('service_role')
    || normalized.includes('secret');
}

function buildEnvironment(envEntries) {
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  
  let supabaseUrl = envEntries.SUPABASE_URL || hardcodedDefaults.supabaseUrl;
  let supabaseAnonKey = envEntries.SUPABASE_ANON_KEY || hardcodedDefaults.supabaseAnonKey;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isCI) {
      console.warn('[sync-environment] Entorno CI detectado: Usando valores dummy para Supabase.');
      supabaseUrl = supabaseUrl || 'https://dummy-project.supabase.co';
      supabaseAnonKey = supabaseAnonKey || 'dummy-anon-key';
    } else {
      throw new Error(
        'Faltan variables requeridas para Supabase. Define SUPABASE_URL y SUPABASE_ANON_KEY en nexora-app/.env o como variables de entorno antes de ejecutar start/build.'
      );
    }
  }

  if (looksLikeSecretKey(supabaseAnonKey)) {
    throw new Error(
      'SUPABASE_ANON_KEY no puede ser una clave secreta. Usa la anon/public key de Supabase; nunca la service_role ni una key que empiece con sb_secret.'
    );
  }

  return {
    production: false,
    apiBaseUrl: envEntries.API_BASE_URL || hardcodedDefaults.apiBaseUrl,
    graphqlUrl: envEntries.GRAPHQL_URL || hardcodedDefaults.graphqlUrl,
    supabaseUrl,
    supabaseAnonKey,
  };
}

function buildProductionEnvironment(envEntries) {
  const developmentEnvironment = buildEnvironment(envEntries);

  return {
    ...developmentEnvironment,
    production: true,
  };
}

function toEnvironmentFile(environment) {
  return [
    'export const environment = {',
    `  production: ${environment.production},`,
    `  apiBaseUrl: ${JSON.stringify(environment.apiBaseUrl)},`,
    `  graphqlUrl: ${JSON.stringify(environment.graphqlUrl)},`,
    `  supabaseUrl: ${JSON.stringify(environment.supabaseUrl)},`,
    `  supabaseAnonKey: ${JSON.stringify(environment.supabaseAnonKey)},`,
    '};',
    '',
  ].join('\n');
}

const envEntries = {
  ...(existsSync(envPath) ? parseEnv(readFileSync(envPath, 'utf8')) : {}),
  ...Object.fromEntries(
    Object.entries(processEnvEntries).filter(([, value]) => typeof value === 'string' && value.length > 0)
  ),
};

if (!existsSync(envPath)) {
  console.warn('[sync-environment] No se encontro .env; se usaran valores por defecto.');
}

const environment = buildEnvironment(envEntries);
const productionEnvironment = buildProductionEnvironment(envEntries);

writeFileSync(environmentPath, toEnvironmentFile(environment), 'utf8');
writeFileSync(environmentProdPath, toEnvironmentFile(productionEnvironment), 'utf8');

console.log('[sync-environment] Archivos src/environments/environment.generated.ts y environment.generated.prod.ts actualizados.');
