import {describe,it,expect} from 'vitest';
import {safeInternalPath} from './account-path';

describe('safeInternalPath',()=>{
  it('preserves internal account destinations',()=>{
    expect(safeInternalPath('/account/orders')).toBe('/account/orders');
    expect(safeInternalPath('/account/security?mode=reset')).toBe('/account/security?mode=reset');
  });
  it('rejects external, protocol-relative, and backslash destinations',()=>{
    expect(safeInternalPath('https://example.com')).toBe('/account');
    expect(safeInternalPath('//example.com')).toBe('/account');
    expect(safeInternalPath('/\\\\example.com')).toBe('/account');
  });
});
