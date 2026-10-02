// build: compila la API y la web (o solo la indicada en APP).
// start: levanta la API en un puerto interno y la web en $PORT; la web
// reenvía /api a la API (ver apps/web/next.config.ts). Si una se cae,
// se detiene todo para que la plataforma reinicie el servicio.
import { spawn, spawnSync } from 'node:child_process';

// Debe coincidir con el puerto por defecto de apps/web/next.config.ts.
const API_INTERNAL_PORT = '3901';

const script = process.argv[2];
console.log(`[verdura-pos] run-app v3 (api + web en un servicio) → ${script}`);
const apps = process.env.APP ? [process.env.APP] : ['api', 'web'];
const production = { ...process.env, NODE_ENV: 'production' };

if (script === 'build') {
  for (const name of apps) {
    const { status } = spawnSync('pnpm', ['--filter', name, 'build'], { stdio: 'inherit', shell: true, env: production });
    if (status !== 0) process.exit(status ?? 1);
  }
} else if (script === 'start') {
  const webPort = process.env.PORT ?? '3000';
  const apiPort = process.env.API_PORT ?? API_INTERNAL_PORT;
  if (apps.length > 1 && apiPort === webPort) {
    console.error(`PORT (${webPort}) no puede ser igual al puerto interno de la API. Cambia o borra la variable PORT.`);
    process.exit(1);
  }
  const ports = { api: apps.length > 1 ? apiPort : webPort, web: webPort };
  const children = apps.map((name) =>
    spawn('pnpm', ['--filter', name, 'start'], {
      stdio: 'inherit',
      shell: true,
      env: { ...production, PORT: ports[name] },
    }),
  );
  const stopAll = (code) => {
    for (const child of children) child.kill('SIGTERM');
    process.exit(code ?? 1);
  };
  for (const child of children) child.on('exit', stopAll);
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stopAll(0));
} else {
  console.error(`Script desconocido: "${script}" (usa build o start).`);
  process.exit(1);
}
