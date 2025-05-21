const { buildAggregationPipeline, buildUserAggregationPipeline } = require('../../src/utils/pipelineUtils');

describe('PipelineUtils', () => {
  describe('buildAggregationPipeline', () => {
    it('debe construir un pipeline básico con filtros simples', () => {
      
      const filters = { category: 'Teatro' };
      const options = { page: 1, limit: 10 };
      
      
      const pipeline = buildAggregationPipeline(filters, options);
      
      
      expect(pipeline).toHaveLength(5);
      expect(pipeline[0].$match).toEqual(filters);
      expect(pipeline[1].$addFields).toEqual({ id: '$_id' });
      expect(pipeline[2].$skip).toBe(0); // (page 1 - 1) * limit 10 = 0
      expect(pipeline[3].$limit).toBe(10);
      expect(pipeline[4].$project).toBeDefined();
    });
    
    it('debe aplicar ordenamiento cuando se especifica', () => {
      
      const filters = {};
      const options = { 
        page: 1, 
        limit: 10,
        sort: 'createdAt',
        order: 'desc'
      };
      
      
      const pipeline = buildAggregationPipeline(filters, options);
      
      
      // Verificar que existe la etapa de ordenamiento antes de la paginación
      const sortStage = pipeline.find(stage => stage.$sort);
      expect(sortStage).toBeDefined();
      expect(sortStage.$sort.createdAt).toBe(-1); // -1 para desc
    });

    it('debe aplicar ordenamiento ascendente cuando se especifica', () => {
      
      const filters = {};
      const options = { 
        page: 1, 
        limit: 10,
        sort: 'startDate',
        order: 'asc'
      };
      
      
      const pipeline = buildAggregationPipeline(filters, options);
      
      
      const sortStage = pipeline.find(stage => stage.$sort);
      expect(sortStage).toBeDefined();
      expect(sortStage.$sort.startDate).toBe(1); // 1 para asc
    });
    
    it('debe aplicar paginación correctamente', () => {
      
      const filters = {};
      const options = { page: 3, limit: 15 };
      
      
      const pipeline = buildAggregationPipeline(filters, options);
      
      
      const skipStage = pipeline.find(stage => stage.$skip !== undefined);
      const limitStage = pipeline.find(stage => stage.$limit !== undefined);
      
      expect(skipStage).toBeDefined();
      expect(limitStage).toBeDefined();
      expect(skipStage.$skip).toBe(30); // (page 3 - 1) * limit 15 = 30
      expect(limitStage.$limit).toBe(15);
    });
    
    it('debe añadir filtros de precio cuando se especifican', () => {
      
      const filters = {};
      const options = { 
        page: 1, 
        limit: 10,
        minPrice: '10.5',
        maxPrice: '50'
      };
      
      
      const pipeline = buildAggregationPipeline(filters, options);
      
      
      // Verificar que se añade el cálculo de minPrice
      const addFieldsMinPriceStage = pipeline.find(
        stage => stage.$addFields && stage.$addFields.minPrice
      );
      expect(addFieldsMinPriceStage).toBeDefined();
      
      // Verificar que se añade el filtro de precio
      const priceFilterStage = pipeline.find(
        stage => stage.$match && stage.$match.$expr
      );
      expect(priceFilterStage).toBeDefined();
      
      // Verificar que el filtro incluye minPrice y maxPrice
      const andCondition = priceFilterStage.$match.$expr.$and;
      expect(andCondition).toHaveLength(2);
      
      // Primero verifica minPrice
      expect(andCondition[0].$gte[0]).toBe('$minPrice');
      expect(andCondition[0].$gte[1]).toBe(10.5);
      
      // Luego verifica maxPrice
      expect(andCondition[1].$lte[0]).toBe('$minPrice');
      expect(andCondition[1].$lte[1]).toBe(50);
    });
    
    it('debe aplicar solo minPrice cuando solo se especifica este', () => {
      
      const filters = {};
      const options = { 
        page: 1, 
        limit: 10,
        minPrice: '20'
      };
      
      
      const pipeline = buildAggregationPipeline(filters, options);
      
      
      const priceFilterStage = pipeline.find(
        stage => stage.$match && stage.$match.$expr
      );
      expect(priceFilterStage).toBeDefined();
      
      // Verificar que el filtro incluye solo minPrice
      const andCondition = priceFilterStage.$match.$expr.$and;
      expect(andCondition).toHaveLength(1);
      expect(andCondition[0].$gte[0]).toBe('$minPrice');
      expect(andCondition[0].$gte[1]).toBe(20);
    });
    
    it('debe aplicar solo maxPrice cuando solo se especifica este', () => {
      
      const filters = {};
      const options = { 
        page: 1, 
        limit: 10,
        maxPrice: '100'
      };
      
      
      const pipeline = buildAggregationPipeline(filters, options);
      
      
      const priceFilterStage = pipeline.find(
        stage => stage.$match && stage.$match.$expr
      );
      expect(priceFilterStage).toBeDefined();
      
      // Verificar que el filtro incluye solo maxPrice
      const andCondition = priceFilterStage.$match.$expr.$and;
      expect(andCondition).toHaveLength(1);
      expect(andCondition[0].$lte[0]).toBe('$minPrice');
      expect(andCondition[0].$lte[1]).toBe(100);
    });
    
    it('debe añadir lookup y cálculo de commentCount cuando se ordena por comments', () => {
      
      const filters = {};
      const options = { 
        page: 1, 
        limit: 10,
        sort: 'comments',
        order: 'desc'
      };
      
      
      const pipeline = buildAggregationPipeline(filters, options);
      
      
      // Verificar que existe la etapa de lookup para comments
      const lookupStage = pipeline.find(stage => stage.$lookup && stage.$lookup.from === 'comments');
      expect(lookupStage).toBeDefined();
      
      // Verificar que existe la etapa para calcular commentCount
      const addFieldsCommentCountStage = pipeline.find(
        stage => stage.$addFields && stage.$addFields.commentCount
      );
      expect(addFieldsCommentCountStage).toBeDefined();
      
      // Verificar que el ordenamiento usa commentCount
      const sortStage = pipeline.find(stage => stage.$sort);
      expect(sortStage).toBeDefined();
      expect(sortStage.$sort.commentCount).toBe(-1); // -1 para desc
    });
    
    it('debe excluir campos específicos en la proyección final', () => {
      
      const filters = {};
      const options = { page: 1, limit: 10 };
      
      
      const pipeline = buildAggregationPipeline(filters, options);
      
      
      const projectStage = pipeline.find(stage => stage.$project);
      expect(projectStage).toBeDefined();
      expect(projectStage.$project.commentCount).toBe(0);
      expect(projectStage.$project.minPrice).toBe(0);
      expect(projectStage.$project.__v).toBe(0);
      expect(projectStage.$project._id).toBe(0);
    });
  });
  
  describe('buildUserAggregationPipeline', () => {
    it('debe construir un pipeline básico para usuarios', () => {
      
      const filters = { active: true };
      const options = {
        sortField: 'name',
        order: 'asc',
        page: 1,
        limit: 10
      };
      
      
      const pipeline = buildUserAggregationPipeline(filters, options);
      
      
      expect(pipeline).toHaveLength(7);
      expect(pipeline[0].$match).toEqual(filters);
      expect(pipeline[1].$lookup).toBeDefined();
      expect(pipeline[1].$lookup.from).toBe('comments');
      
      // Verificar que existe la etapa para calcular campos adicionales
      const addFieldsStage = pipeline[2].$addFields;
      expect(addFieldsStage).toBeDefined();
      expect(addFieldsStage.id).toBe('$_id');
      expect(addFieldsStage.commentCount).toBeDefined();
      expect(addFieldsStage.commentCountEnabled).toBeDefined();
      expect(addFieldsStage.commentCountDisabled).toBeDefined();
      
      // Verificar ordenamiento
      expect(pipeline[3].$sort).toEqual({ name: 1, _id: 1 });
      
      // Verificar paginación
      expect(pipeline[4].$skip).toBe(0); // (page 1 - 1) * limit 10 = 0
      expect(pipeline[5].$limit).toBe(10);
      
      // Verificar proyección
      expect(pipeline[6].$project).toBeDefined();
      expect(pipeline[6].$project.password).toBe(0);
      expect(pipeline[6].$project.__v).toBe(0);
      expect(pipeline[6].$project._id).toBe(0);
      expect(pipeline[6].$project.comments).toBe(0);
      expect(pipeline[6].$project.commentDocs).toBe(0);
    });
    
    it('debe aplicar ordenamiento descendente cuando se especifica', () => {
      
      const filters = {};
      const options = {
        sortField: 'createdAt',
        order: 'desc',
        page: 1,
        limit: 10
      };
      
      
      const pipeline = buildUserAggregationPipeline(filters, options);
      
      
      expect(pipeline[3].$sort).toEqual({ createdAt: -1, _id: 1 });
    });
    
    it('debe mantener el valor de _id en el ordenamiento si ya está especificado', () => {
      
      const filters = {};
      const options = {
        sortField: '_id',
        order: 'desc',
        page: 1,
        limit: 10
      };
      
      
      const pipeline = buildUserAggregationPipeline(filters, options);
      
      
      expect(pipeline[3].$sort).toEqual({ _id: -1 });
      // Asegurarse de que no se añadió _id: 1 adicional
      const sortKeys = Object.keys(pipeline[3].$sort);
      expect(sortKeys).toHaveLength(1);
    });
    
    it('debe aplicar valores por defecto para orden, página y límite', () => {
      
      const filters = {};
      const options = {
        sortField: 'name'
      };
      
      
      const pipeline = buildUserAggregationPipeline(filters, options);
      
      
      expect(pipeline[3].$sort.name).toBe(-1); // desc por defecto
      expect(pipeline[4].$skip).toBe(0); // page 1 por defecto
      expect(pipeline[5].$limit).toBe(10); // limit 10 por defecto
    });
    
    it('debe calcular correctamente el skip para páginas superiores', () => {
      
      const filters = {};
      const options = {
        sortField: 'name',
        page: 5,
        limit: 15
      };
      
      
      const pipeline = buildUserAggregationPipeline(filters, options);
      
      
      expect(pipeline[4].$skip).toBe(60); // (page 5 - 1) * limit 15 = 60
      expect(pipeline[5].$limit).toBe(15);
    });
    
    it('debe reconocer orden "asc" en minúsculas o mayúsculas', () => {
      
      const filters = {};
      const optionsLower = {
        sortField: 'name',
        order: 'asc'
      };
      const optionsUpper = {
        sortField: 'name',
        order: 'ASC'
      };
      
      
      const pipelineLower = buildUserAggregationPipeline(filters, optionsLower);
      const pipelineUpper = buildUserAggregationPipeline(filters, optionsUpper);
      
      
      expect(pipelineLower[3].$sort.name).toBe(1);
      expect(pipelineUpper[3].$sort.name).toBe(1);
    });
  });
});
