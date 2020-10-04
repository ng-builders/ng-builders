import { sharedLibrary } from './shared-library';

describe('sharedLibrary', () => {
  it('should work', () => {
    expect(sharedLibrary()).toEqual('shared-library');
  });
});
