import {
  BlockedAddressError,
  assertPublicUrl,
  guardedLookup,
  isPrivateAddress,
} from './network-guard';

describe('isPrivateAddress', () => {
  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '::1',
    '::',
    '::ffff:127.0.0.1',
    '::ffff:7f00:1',
    'fd00::1',
    'fe80::1',
  ])('blocks %s', (address) => {
    expect(isPrivateAddress(address)).toBe(true);
  });

  it.each(['8.8.8.8', '1.1.1.1', '::ffff:808:808', '2606:4700:4700::1111'])(
    'allows %s',
    (address) => {
      expect(isPrivateAddress(address)).toBe(false);
    },
  );
});

describe('assertPublicUrl', () => {
  it.each([
    'http://127.0.0.1/health',
    'http://[::1]:4000/',
    'http://[::ffff:169.254.169.254]/',
    'http://169.254.169.254/latest/meta-data',
  ])('rejects %s', (url) => {
    expect(() => assertPublicUrl(new URL(url))).toThrow(BlockedAddressError);
  });

  it('rejects non-http schemes', () => {
    expect(() => assertPublicUrl(new URL('file:///etc/passwd'))).toThrow();
  });

  it('allows public hosts', () => {
    expect(() =>
      assertPublicUrl(new URL('https://api.example.com/health')),
    ).not.toThrow();
  });
});

describe('guardedLookup', () => {
  const lookup = (hostname: string, all: boolean) =>
    new Promise<unknown>((resolve, reject) =>
      guardedLookup(hostname, { all }, (error, address) =>
        error ? reject(error) : resolve(address),
      ),
    );

  it('rejects names that resolve to loopback', async () => {
    await expect(lookup('localhost', false)).rejects.toBeInstanceOf(
      BlockedAddressError,
    );
    await expect(lookup('localhost', true)).rejects.toBeInstanceOf(
      BlockedAddressError,
    );
  });
});
