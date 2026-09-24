import { ServiceUnavailableException } from '@nestjs/common';

import type { DatabaseService } from '../database';
import { HealthController } from './health.controller';

jest.mock('../database', () => ({ DatabaseService: class {} }));

describe('HealthController', () => {
  const ping = jest.fn<Promise<void>, []>();
  const controller = new HealthController({
    ping,
  } as unknown as DatabaseService);

  beforeEach(() => ping.mockReset());

  it('reports liveness without touching the database', () => {
    expect(controller.live()).toEqual({ status: 'ok' });
    expect(ping).not.toHaveBeenCalled();
  });

  it('reports readiness when the database responds', async () => {
    ping.mockResolvedValue();
    await expect(controller.ready()).resolves.toEqual({
      status: 'ok',
      database: 'up',
    });
  });

  it('reports unavailable when the database fails', async () => {
    ping.mockRejectedValue(new Error('connection failed'));
    await expect(controller.ready()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
