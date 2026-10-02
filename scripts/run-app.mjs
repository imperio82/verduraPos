// Ejecuta un script (build/start) de la app indicada en la variable APP.
// En Railway cada servicio define APP=api o APP=web; en local, sin APP,
// "build" compila las dos apps.
import { spawnSync } from 'node:child_process';

const script = process.argv[2];
const app = process.env.APP;
const onRailway = Boolean(process.env.RAILWAY_ENVIRONMENT);
const apps = app ? [app] : script === 'build' && !onRailway ? ['api', 'web'] : [];

if (apps.length === 0) {
  console.error(`Define APP=api o APP=web para ejecutar "${script}".`);
  process.exit(1);
}

for (const name of apps) {
  const { status } = spawnSync('pnpm', ['--filter', name, script], { stdio: 'inherit', shell: true });
  if (status !== 0) process.exit(status ?? 1);
}
