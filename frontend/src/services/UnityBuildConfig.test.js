import { resolveUnityBuildConfig } from './UnityBuildConfig';

describe('resolveUnityBuildConfig', () => {
  test.each([
    ['newton1', '/games/newton1/Build/newton1'],
    ['newton2', '/games/newton2/Build/newton2'],
    ['newton3', '/games/newton3/Build/newton3'],
    ['race-game', '/games/racegame/Build/racegame'],
    ['geotech-lab1', '/games/geotech-lab1/Build/geotech-lab1'],
    ['geotech-lab2', '/games/geotech-lab2/Build/geotech-lab2']
  ])('uses the expected fallback build prefix for %s', (gameId, prefix) => {
    const config = resolveUnityBuildConfig({ gameId, moduleInfo: null, cacheKey: 'test' });

    expect(config).toEqual(expect.objectContaining({
      loaderUrl: `${prefix}.loader.js?v=test`,
      dataUrl: `${prefix}.data?v=test`,
      frameworkUrl: `${prefix}.framework.js?v=test`,
      codeUrl: `${prefix}.wasm?v=test`,
      streamingAssetsUrl: `${prefix.split('/Build/')[0]}/StreamingAssets`
    }));
  });

  test('accepts a backend build path that already points to a loader file', () => {
    const config = resolveUnityBuildConfig({
      gameId: 'geotech-lab1',
      moduleInfo: {
        build_path: '/games/geotech-lab1/Build/geotech-lab1.loader.js'
      },
      cacheKey: 'mtime'
    });

    expect(config.loaderUrl).toBe('/games/geotech-lab1/Build/geotech-lab1.loader.js?v=mtime');
    expect(config.dataUrl).toBe('/games/geotech-lab1/Build/geotech-lab1.data?v=mtime');
  });

  test('uses the deployed race game cache key ahead of stale module metadata', () => {
    const config = resolveUnityBuildConfig({
      gameId: 'race-game',
      moduleInfo: {
        build_path: '/games/racegame/Build/racegame',
        updated_at: '2026-06-04T18:31:19'
      }
    });

    expect(config.loaderUrl).toBe('/games/racegame/Build/racegame.loader.js?v=1784224376000');
    expect(config.dataUrl).toBe('/games/racegame/Build/racegame.data?v=1784224376000');
  });

  test('returns null when neither backend nor fallback build path exists', () => {
    expect(resolveUnityBuildConfig({ gameId: 'missing-module', moduleInfo: null })).toBeNull();
  });
});
