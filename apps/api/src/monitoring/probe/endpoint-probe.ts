import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Agent, fetch } from 'undici';

import { AppConfigService } from '../../config';
import {
  BlockedAddressError,
  assertPublicUrl,
  guardedLookup,
} from './network-guard';

export type ProbeResult = {
  responseStatus: number | null;
  latencyMs: number | null;
  errorMessage: string | null;
};

const MAX_REDIRECTS = 5;
const USER_AGENT = 'Emberline/1.0 (+https://emberline.dev)';

const networkErrors: Record<string, string> = {
  ENOTFOUND: 'Could not resolve the endpoint hostname',
  EAI_AGAIN: 'DNS lookup failed',
  ECONNREFUSED: 'Connection refused',
  ECONNRESET: 'Connection reset by the server',
  EHOSTUNREACH: 'Host unreachable',
  CERT_HAS_EXPIRED: 'TLS certificate has expired',
  DEPTH_ZERO_SELF_SIGNED_CERT: 'TLS certificate is self-signed',
  ERR_TLS_CERT_ALTNAME_INVALID: 'TLS certificate does not match the hostname',
};

@Injectable()
export class EndpointProbe implements OnApplicationShutdown {
  private readonly agent: Agent;
  private readonly allowPrivate: boolean;
  private readonly timeoutMs: number;

  constructor(config: AppConfigService) {
    this.allowPrivate = config.checkAllowPrivateNetworks;
    this.timeoutMs = config.checkTimeoutMs;
    this.agent = new Agent({
      connect: this.allowPrivate ? {} : { lookup: guardedLookup },
    });
  }

  async onApplicationShutdown() {
    await this.agent.close();
  }

  // Latency is time to response headers across all redirect hops; the body is
  // never read.
  async probe(endpoint: string): Promise<ProbeResult> {
    const signal = AbortSignal.timeout(this.timeoutMs);
    const startedAt = performance.now();

    try {
      let url = new URL(endpoint);
      for (let hop = 0; ; hop++) {
        if (!this.allowPrivate) assertPublicUrl(url);

        const response = await fetch(url, {
          redirect: 'manual',
          signal,
          dispatcher: this.agent,
          headers: { 'user-agent': USER_AGENT, accept: '*/*' },
        });
        const latencyMs = Math.round(performance.now() - startedAt);
        await response.body?.cancel();

        const location = response.headers.get('location');
        const isRedirect = response.status >= 300 && response.status < 400;
        if (isRedirect && location && hop < MAX_REDIRECTS) {
          url = new URL(location, url);
          continue;
        }

        return {
          responseStatus: response.status,
          latencyMs,
          errorMessage: null,
        };
      }
    } catch (error) {
      return {
        responseStatus: null,
        latencyMs: null,
        errorMessage: signal.aborted
          ? `Timed out after ${this.timeoutMs / 1000}s`
          : describe(error),
      };
    }
  }
}

function describe(error: unknown): string {
  for (let current = error; current instanceof Error;) {
    if (current instanceof BlockedAddressError) return current.message;
    const code = (current as NodeJS.ErrnoException).code;
    if (code && networkErrors[code]) return networkErrors[code];
    if (!current.cause) return current.message;
    current = current.cause;
  }
  return 'Request failed';
}
