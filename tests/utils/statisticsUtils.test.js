const { filterDate } = require('../../src/utils/statisticsUtils');

describe('StatisticsUtils', () => {
  describe('filterDate', () => {
    // Mock de Date para tener una fecha fija en todas las pruebas
    const realDate = global.Date;
    const mockDate = new Date(2025, 4, 21); // 21 de mayo de 2025

    beforeAll(() => {
      global.Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            return new realDate(mockDate);
          }
          return new realDate(...args);
        }
        static now() {
          return new realDate(mockDate).getTime();
        }
      };
    });

    afterAll(() => {
      global.Date = realDate;
    });

    it('debe crear un pipeline para el rango de 1 semana', () => {
      
      const result = filterDate('1w');

      
      expect(result).toHaveLength(4);
      
      // Verificar la condición de match para la fecha
      const expectedStartDate = new Date(2025, 4, 14).toISOString().split('T')[0]; // 7 días atrás
      expect(result[0].$match.date.$gte).toBe(expectedStartDate);
      
      // Verificar que el agrupamiento incluya días
      expect(result[1].$group._id).toHaveProperty('day');
      
      // Verificar que el proyecto incluya días de la semana
      expect(result[3].$project).toHaveProperty('number');
    });

    it('debe crear un pipeline para el rango de 1 mes', () => {
      
      const result = filterDate('1m');

      
      expect(result).toHaveLength(4);
      
      // Verificar la condición de match para la fecha
      const expectedStartDate = new Date(2025, 3, 21).toISOString().split('T')[0]; // 1 mes atrás
      expect(result[0].$match.date.$gte).toBe(expectedStartDate);
      
      // Verificar que el agrupamiento incluya días
      expect(result[1].$group._id).toHaveProperty('day');
    });

    it('debe crear un pipeline para el rango de 3 meses', () => {
      
      const result = filterDate('3m');

      
      expect(result).toHaveLength(4);
      
      // Verificar la condición de match para la fecha
      const expectedStartDate = new Date(2025, 1, 21).toISOString().split('T')[0]; // 3 meses atrás
      expect(result[0].$match.date.$gte).toBe(expectedStartDate);
      
      // Verificar que el agrupamiento NO incluya días
      expect(result[1].$group._id).not.toHaveProperty('day');
    });

    it('debe crear un pipeline para el rango de 6 meses', () => {
      
      const result = filterDate('6m');

      
      expect(result).toHaveLength(4);
      
      // Verificar la condición de match para la fecha
      const expectedStartDate = new Date(2024, 10, 21).toISOString().split('T')[0]; // 6 meses atrás
      expect(result[0].$match.date.$gte).toBe(expectedStartDate);
    });

    it('debe crear un pipeline para el rango de 9 meses', () => {
      
      const result = filterDate('9m');

      
      expect(result).toHaveLength(4);
      
      // Verificar la condición de match para la fecha
      const expectedStartDate = new Date(2024, 7, 21).toISOString().split('T')[0]; // 9 meses atrás
      expect(result[0].$match.date.$gte).toBe(expectedStartDate);
    });

    it('debe crear un pipeline para el rango de 12 meses', () => {
      
      const result = filterDate('12m');

      
      expect(result).toHaveLength(4);
      
      // Verificar la condición de match para la fecha
      const expectedStartDate = new Date(2024, 4, 21).toISOString().split('T')[0]; // 12 meses atrás
      expect(result[0].$match.date.$gte).toBe(expectedStartDate);
    });

    it('debe usar el rango de 12 meses por defecto cuando se proporciona un rango inválido', () => {
      
      const result = filterDate('invalid_range');

      
      expect(result).toHaveLength(4);
      
      // Verificar la condición de match para la fecha (debe ser igual a 12 meses)
      const expectedStartDate = new Date(2024, 4, 21).toISOString().split('T')[0]; // 12 meses atrás
      expect(result[0].$match.date.$gte).toBe(expectedStartDate);
    });

    it('debe incluir los meses en español en la proyección', () => {
      
      const result = filterDate('6m');

      
      // Verificar que name utilice el array de meses en español
      expect(result[3].$project.name.$arrayElemAt[0]).toEqual([
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ]);
    });

    it('debe incluir los días de la semana en español para rangos cortos', () => {
      
      const result = filterDate('1w');

      
      // Verificar que name utilice el array de días en español
      expect(result[3].$project.name.$arrayElemAt[0]).toEqual([
        "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
      ]);
    });
  });
});