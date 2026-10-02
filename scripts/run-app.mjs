// build: compila la API y la web (o solo la indicada en APP).
// start: levanta la API en un puerto interno y la web en $PORT; la web
// reenvía /api a la API (ver apps/web/next.config.ts). Si una se cae,
// se detiene todo para que la plataforma reinicie el servicio.
import { spawn, spawnSync } from 'node:child_process';

const script = process.argv[2];
const apps = process.env.APP ? [process.env.APP] : ['api', 'web'];
const production = { ...process.env, NODE_ENV: 'production' };

if (script === 'build') {
  for (const name of apps) {
    const { status } = spawnSync('pnpm', ['--filter', name, 'build'], { stdio: 'inherit', shell: true, env: production });
    if (status !== 0) process.exit(status ?? 1);
  }
} else if (script === 'start') {
  const apiPort = process.env.API_PORT ?? '4000';
  const ports = { api: apiPort, web: process.env.PORT ?? '3000' };
  const children = apps.map((name) =>
    spawn('pnpm', ['--filter', name, 'start'], {
      stdio: 'inherit',
      shell: true,
      env: { ...production, PORT: apps.length > 1 ? ports[name] : process.env.PORT ?? ports[name] },
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
