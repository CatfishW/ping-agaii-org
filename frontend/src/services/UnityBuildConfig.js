export const UNITY_BUILD_MAP = {
  'forces-motion-basics': {
    buildPrefix: '/games/Force&Motion/Build/20251122DrivingBuild'
  },
  newton1: {
    buildPrefix: '/games/newton1/Build/newton1'
  },
  newton2: {
    buildPrefix: '/games/newton2/Build/newton2'
  },
  newton3: {
    buildPrefix: '/games/newton3/Build/newton3'
  },
  'race-game': {
    buildPrefix: '/games/racegame/Build/racegame',
    cacheKey: '1784142890000'
  },
  'geotech-lab1': {
    buildPrefix: '/games/geotech-lab1/Build/geotech-lab1'
  },
  'geotech-lab2': {
    buildPrefix: '/games/geotech-lab2/Build/geotech-lab2'
  },
  gameheart: {
    buildPrefix: '/games/gameheart/Build/heart'
  },
  gamemeetingcells: {
    buildPrefix: '/games/gamemeetingcells/Build/MeetingCells_NewEnv'
  }
};

const loaderSuffix = '.loader.js';

const normalizeBuildPrefix = (path) => {
  if (!path) return '';
  const trimmed = path.trim();
  return trimmed.endsWith(loaderSuffix)
    ? trimmed.slice(0, -loaderSuffix.length)
    : trimmed.replace(/\/$/, '');
};

const getCacheKey = ({ cacheKey, moduleInfo, fallbackCacheKey }) => {
  if (cacheKey) return cacheKey;
  if (fallbackCacheKey) return fallbackCacheKey;
  if (moduleInfo?.updated_at) {
    return new Date(moduleInfo.updated_at).getTime().toString();
  }
  return moduleInfo?.version || '1.0.0';
};

export const resolveUnityBuildConfig = ({ gameId, moduleInfo, cacheKey }) => {
  const fallbackBuild = UNITY_BUILD_MAP[gameId] || {};
  const rawPath = moduleInfo?.build_path || fallbackBuild.buildPrefix || '';
  const prefix = normalizeBuildPrefix(rawPath);
  if (!prefix) return null;

  const versionKey = getCacheKey({ cacheKey, moduleInfo, fallbackCacheKey: fallbackBuild.cacheKey });
  const withCacheKey = (url) => `${url}?v=${encodeURIComponent(versionKey)}`;

  return {
    loaderUrl: withCacheKey(`${prefix}${loaderSuffix}`),
    dataUrl: withCacheKey(`${prefix}.data`),
    frameworkUrl: withCacheKey(`${prefix}.framework.js`),
    codeUrl: withCacheKey(`${prefix}.wasm`),
    streamingAssetsUrl: `${prefix.split('/Build/')[0]}/StreamingAssets`
  };
};
