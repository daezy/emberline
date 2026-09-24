import { lookup as dnsLookup } from 'node:dns';
import type { LookupAddress, LookupOptions } from 'node:dns';
import { BlockList, isIP } from 'node:net';

const blocked = new BlockList();
for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const) {
  blocked.addSubnet(network, prefix, 'ipv4');
}
for (const [network, prefix] of [
  ['::', 128],
  ['::1', 128],
  // NAT64 can smuggle a private IPv4 target. IPv4-mapped addresses
  // (::ffff:a.b.c.d) are matched against the IPv4 rules by BlockList itself.
  ['64:ff9b::', 96],
  ['100::', 64],
  ['2001:db8::', 32],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  blocked.addSubnet(network, prefix, 'ipv6');
}

export class BlockedAddressError extends Error {
  constructor() {
    super('Endpoint resolves to a private or reserved network address');
  }
}

export function isPrivateAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 0) return false;
  return blocked.check(address, family === 4 ? 'ipv4' : 'ipv6');
}

type LookupCallback = (
  error: NodeJS.ErrnoException | null,
  address: string | LookupAddress[],
  family?: number,
) => void;

// Checked at connect time, so a hostname cannot pass validation and then
// resolve to an internal address (DNS rebinding).
export function guardedLookup(
  hostname: string,
  options: LookupOptions,
  callback: LookupCallback,
) {
  dnsLookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) return callback(error, []);
    if (addresses.some(({ address }) => isPrivateAddress(address))) {
      return callback(new BlockedAddressError(), []);
    }
    if (options.all) return callback(null, addresses);
    const [first] = addresses;
    callback(null, first.address, first.family);
  });
}

// IP literals skip DNS, so the connect-time lookup never sees them.
export function assertPublicUrl(url: URL) {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http and https endpoints can be checked');
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (isPrivateAddress(host)) {
    throw new BlockedAddressError();
  }
}
