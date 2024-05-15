import { is } from 'bpmn-js/lib/util/ModelUtil';

export default {
  __init__: [ 'implementationsPropertiesProvider' ],
  implementationsPropertiesProvider: [ 'type', require('../providers/implementations/ImplementationsPropertiesProvider') ],
};
