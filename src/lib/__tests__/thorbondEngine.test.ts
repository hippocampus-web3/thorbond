import ThorBondEngine from '../thorbondEngine';

describe('ThorBondEngine', () => {
  let engine: ThorBondEngine;

  beforeEach(() => {
    // Limpiar la instancia singleton antes de cada prueba
    (ThorBondEngine as any).instance = null;
    engine = ThorBondEngine.getInstance();
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = ThorBondEngine.getInstance();
      const instance2 = ThorBondEngine.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should fetch and transform actions from Midgard API', async () => {
      await engine.initialize();
      const actions = engine.getActions();
      
      // Verificar que se obtuvieron acciones
      expect(actions.length).toBeGreaterThan(0);
      
      // Verificar la estructura de una acción
      const firstAction = actions[0];
      expect(firstAction).toHaveProperty('type');
      expect(firstAction.type).toBe('send');
      expect(firstAction).toHaveProperty('data');
      expect(firstAction).toHaveProperty('timestamp');
      
      // Verificar que los datos tienen la estructura correcta
      expect(firstAction.data).toHaveProperty('height');
      expect(firstAction.data).toHaveProperty('in');
      expect(firstAction.data).toHaveProperty('out');
      expect(firstAction.data).toHaveProperty('pools');
      expect(firstAction.data).toHaveProperty('status');
      expect(firstAction.data).toHaveProperty('metadata');
    });

    it('should not fetch actions if already initialized', async () => {
      await engine.initialize();
      const firstActions = engine.getActions();
      
      await engine.initialize();
      const secondActions = engine.getActions();
      
      // Verificar que las acciones son las mismas
      expect(secondActions).toEqual(firstActions);
    });
  });

  describe('getActions', () => {
    it('should throw error if not initialized', () => {
      expect(() => engine.getActions()).toThrow('ThorBondEngine not initialized');
    });

    it('should return actions after initialization', async () => {
      await engine.initialize();
      const actions = engine.getActions();
      expect(actions.length).toBeGreaterThan(0);
      // Verificar que todas las acciones son de tipo 'send'
      actions.forEach(action => {
        expect(action.type).toBe('send');
      });
    });
  });

  describe('refreshActions', () => {
    it('should reinitialize and fetch new actions', async () => {
      await engine.initialize();
      const firstActions = engine.getActions();
      
      // Esperar un momento para asegurar que hay nuevas acciones
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await engine.refreshActions();
      const secondActions = engine.getActions();
      
      // Verificar que las acciones son diferentes
      expect(secondActions).not.toEqual(firstActions);
    });
  });
}); 