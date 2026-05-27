import { TelemetryService } from './TelemetryService';

describe('TelemetryService frontend gameplay telemetry', () => {
  let service;

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true });
    service = new TelemetryService();
    service.initialize({
      sessionId: 'session-1',
      userId: null,
      guestId: 'guest-1',
      moduleId: 'geotech-lab1',
      consentGranted: true,
      orgSettings: {
        capture_keyboard: false,
        capture_focus_blur: false,
        batch_ms: 60000
      }
    });
  });

  afterEach(() => {
    service.stopListening();
    if (service.uploadTimer) {
      clearInterval(service.uploadTimer);
    }
    jest.restoreAllMocks();
  });

  it('records game canvas clicks with relative coordinates and route order', () => {
    const canvas = {
      id: 'unity-canvas-geotech-lab1',
      getBoundingClientRect: () => ({
        left: 10,
        top: 20,
        width: 400,
        height: 300
      })
    };

    service.recordGameCanvasClick(
      { clientX: 210, clientY: 170, button: 0, pointerType: 'mouse' },
      canvas,
      { gameId: 'geotech-lab1', phase: 'gameplay' }
    );

    const clickEvent = service.eventBuffer.find((event) => event.event_type === 'click');
    expect(clickEvent.payload).toMatchObject({
      source: 'frontend_canvas',
      target: 'UNITY_CANVAS',
      game_id: 'geotech-lab1',
      element_id: 'unity-canvas-geotech-lab1',
      phase: 'gameplay',
      button: 0,
      pointer_type: 'mouse',
      canvas_x: 200,
      canvas_y: 150,
      normalized_x: 0.5,
      normalized_y: 0.5,
      click_sequence: 1,
      route_step: 1
    });
    expect(service.getStats().routeSteps).toBe(1);
  });

  it('records frontend route events as structured game events', () => {
    service.logFrontendRouteEvent('unity_load_completed', {
      gameId: 'geotech-lab1',
      phase: 'loading',
      status: 'completed'
    });

    const routeEvent = service.eventBuffer.find(
      (event) => event.event_type === 'game_event' && event.payload.event_name === 'unity_load_completed'
    );
    expect(routeEvent.payload).toMatchObject({
      event_name: 'unity_load_completed',
      verb: 'experienced',
      object_id: 'frontend/geotech-lab1/unity_load_completed',
      object_name: 'unity_load_completed',
      phase: 'loading',
      status: 'completed',
      context: {
        source: 'frontend',
        game_id: 'geotech-lab1',
        route_step: 1
      }
    });
  });
});
