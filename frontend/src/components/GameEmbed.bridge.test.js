import React from 'react';
import '@testing-library/jest-dom';
import { act, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

let mockAuthUser = null;
const mockHandlers = {};

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockAuthUser })
}));

jest.mock('../services/TelemetryService', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    logFrontendRouteEvent: jest.fn(),
    logBridgeEvent: jest.fn(),
    logGameEvent: jest.fn(),
    getStats: jest.fn(() => ({ totalEvents: 0, isEnabled: true })),
    recordGameCanvasClick: jest.fn(),
    setUnityFocus: jest.fn(),
    endSession: jest.fn(() => Promise.resolve())
  }
}));

jest.mock('../services/UnityBridge', () => ({
  __esModule: true,
  default: {
    setUnityWindow: jest.fn(),
    on: jest.fn((type, handler) => {
      mockHandlers[type] = handler;
    }),
    off: jest.fn((type, handler) => {
      if (mockHandlers[type] === handler) {
        delete mockHandlers[type];
      }
    }),
    sendToGame: jest.fn(),
    telemetryStarted: jest.fn()
  }
}));

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

const axios = require('axios');
const GameEmbed = require('./GameEmbed').default;
const telemetryService = require('../services/TelemetryService').default;
const unityBridge = require('../services/UnityBridge').default;

const latestHandler = (type) => {
  const call = [...unityBridge.on.mock.calls].reverse().find(([eventType]) => eventType === type);
  return call ? call[1] : undefined;
};

const renderGameEmbed = (onUnityGameEvent = jest.fn()) => render(
  <MemoryRouter initialEntries={['/game/newton1']}>
    <Routes>
      <Route path="/game/:gameId" element={<GameEmbed onUnityGameEvent={onUnityGameEvent} />} />
    </Routes>
  </MemoryRouter>
);

describe('GameEmbed bridge integration', () => {
  beforeEach(() => {
    mockAuthUser = {
      id: 7,
      email: 'student@example.com',
      full_name: 'Student A',
      role: 'student',
      organization_id: 2
    };
    Object.keys(mockHandlers).forEach((key) => delete mockHandlers[key]);
    localStorage.setItem('access_token', 'token-1');

    axios.get.mockImplementation((url) => {
      if (url === '/api/auth/consent/check') {
        return Promise.resolve({ data: { has_consent: true } });
      }
      if (url === '/api/simulations/newton1') {
        return Promise.resolve({
          data: {
            module_id: 'newton1',
            title: "Newton's First Law",
            build_path: null,
            version: '1.0.0'
          }
        });
      }
      return Promise.reject(new Error(`unexpected GET ${url}`));
    });

    axios.post.mockImplementation((url) => {
      if (url === '/api/telemetry/session/start') {
        return Promise.resolve({
          data: {
            session_id: 'session-1',
            user_id: 7,
            guest_id: null,
            org_settings: { telemetry_enabled: true }
          }
        });
      }
      if (url === '/api/telemetry/session/end') {
        return Promise.resolve({ data: { success: true } });
      }
      return Promise.reject(new Error(`unexpected POST ${url}`));
    });
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('continues after an anonymous-to-account consent handoff', async () => {
    sessionStorage.setItem('pingConsentHandoff', JSON.stringify({
      terms_accepted: true,
      privacy_accepted: true,
      data_collection_accepted: true,
      cookie_accepted: false,
      accepted_at: Date.now()
    }));

    axios.get.mockImplementation((url) => {
      if (url === '/api/auth/consent/check') {
        return Promise.resolve({ data: { has_consent: false } });
      }
      if (url === '/api/simulations/newton1') {
        return Promise.resolve({
          data: {
            module_id: 'newton1',
            title: "Newton's First Law",
            build_path: null,
            version: '1.0.0'
          }
        });
      }
      return Promise.reject(new Error(`unexpected GET ${url}`));
    });

    const defaultPost = axios.post.getMockImplementation();
    axios.post.mockImplementation((url, ...args) => {
      if (url === '/api/auth/consent') {
        return Promise.resolve({ data: { success: true } });
      }
      return defaultPost(url, ...args);
    });

    renderGameEmbed();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/auth/consent',
        expect.objectContaining({
          terms_accepted: true,
          privacy_accepted: true,
          data_collection_accepted: true
        }),
        expect.objectContaining({
          headers: { Authorization: 'Bearer token-1' }
        })
      );
    });
  });

  test('responds to auth_request with a privacy-safe auth context', async () => {
    renderGameEmbed();

    await waitFor(() => {
      expect(latestHandler('auth_request')).toEqual(expect.any(Function));
    });

    act(() => {
      latestHandler('auth_request')({}, { messageId: 'auth-1' });
    });

    expect(unityBridge.sendToGame).toHaveBeenCalledWith(
      'auth_context',
      expect.objectContaining({
        schema: 'ping.auth_context.v1',
        sessionId: 'session-1',
        moduleId: 'newton1',
        user: expect.objectContaining({
          isAuthenticated: true,
          role: 'student',
          displayName: 'Student A',
          organizationId: 2
        })
      }),
      { messageId: 'auth-1' }
    );

    const context = unityBridge.sendToGame.mock.calls.find(([type]) => type === 'auth_context')[1];
    expect(JSON.stringify(context)).not.toMatch(/student@example.com|token-1|password/i);
  });

  test('logs normalized game bridge events and forwards them to story containers', async () => {
    const onUnityGameEvent = jest.fn();
    renderGameEmbed(onUnityGameEvent);

    await waitFor(() => {
      expect(latestHandler('game_event')).toEqual(expect.any(Function));
    });

    act(() => {
      latestHandler('game_event')({
        event_name: 'module_complete',
        completed: true,
        value: 'raw student answer'
      });
    });

    expect(telemetryService.logBridgeEvent).toHaveBeenCalledWith(expect.objectContaining({
      event_name: 'module_complete',
      verb: 'completed',
      object_id: 'modules/newton1/events/module_complete',
      completed: true
    }));
    expect(JSON.stringify(telemetryService.logBridgeEvent.mock.calls[0][0])).not.toMatch(/raw student answer/);
    expect(onUnityGameEvent).toHaveBeenCalledWith(expect.objectContaining({
      event_name: 'module_complete',
      completed: true,
      gameId: 'newton1',
      moduleId: 'newton1'
    }));
  });
});
