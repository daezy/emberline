import { createServer } from 'node:http';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import type { AppConfigService } from '../../config';
import { classify } from '../checks/classify';
import { EndpointProbe } from './endpoint-probe';

// @nestjs/config ships ESM that Jest cannot load; the probe only needs the type.
jest.mock('../../config', () => ({ AppConfigService: class {} }));

const makeProbe = (allowPrivate: boolean, timeoutMs = 2_000) =>
  new EndpointProbe({
    checkAllowPrivateNetworks: allowPrivate,
    checkTimeoutMs: timeoutMs,
  } as AppConfigService);

describe('EndpointProbe', () => {
  let server: Server;
  let base: string;
  const probes: EndpointProbe[] = [];
  const probe = (allowPrivate: boolean, timeoutMs?: number) => {
    const instance = makeProbe(allowPrivate, timeoutMs);
    probes.push(instance);
    return instance;
  };

  beforeAll(async () => {
    server = createServer((req, res) => {
      if (req.url === '/redirect') {
        res.writeHead(302, { location: '/ok' }).end();
      } else if (req.url === '/redirect-loop') {
        res.writeHead(302, { location: '/redirect-loop' }).end();
      } else if (req.url === '/waking') {
        res.writeHead(503).end();
      } else if (req.url === '/slow') {
        setTimeout(() => res.writeHead(200).end(), 1_500);
      } else {
        res.writeHead(200).end('ok');
      }
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await Promise.all(probes.map((p) => p.onApplicationShutdown()));
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });

  it('records status and latency', async () => {
    const result = await probe(true).probe(`${base}/ok`);
    expect(result).toMatchObject({ responseStatus: 200, errorMessage: null });
    expect(result.latencyMs).toEqual(expect.any(Number));
    expect(classify(result)).toBe('warm');
  });

  it('follows redirects', async () => {
    const result = await probe(true).probe(`${base}/redirect`);
    expect(result.responseStatus).toBe(200);
  });

  it('rejects redirect loops', async () => {
    const result = await probe(true).probe(`${base}/redirect-loop`);
    expect(result).toMatchObject({
      responseStatus: null,
      errorMessage: 'Too many redirects (maximum 5)',
    });
  });

  it('treats 503 as waking up', async () => {
    const result = await probe(true).probe(`${base}/waking`);
    expect(classify(result)).toBe('warming');
  });

  it('times out', async () => {
    const result = await probe(true, 1_000).probe(`${base}/slow`);
    expect(result).toMatchObject({
      responseStatus: null,
      errorMessage: 'Timed out after 1s',
    });
    expect(classify(result)).toBe('down');
  });

  it('blocks private addresses by default', async () => {
    const result = await probe(false).probe(`${base}/ok`);
    expect(result.responseStatus).toBeNull();
    expect(result.errorMessage).toMatch(/private or reserved/);
  });

  it('blocks hostnames that resolve to private addresses', async () => {
    const port = (server.address() as AddressInfo).port;
    const result = await probe(false).probe(`http://localhost:${port}/ok`);
    expect(result.errorMessage).toMatch(/private or reserved/);
  });
});
