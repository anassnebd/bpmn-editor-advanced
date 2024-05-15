import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';

export default function ImplementationsPropertiesProvider(propertiesPanel, translate) {
  PropertiesActivator.call(this, propertiesPanel);

  // Implement extension methods here
}

ImplementationsPropertiesProvider.$inject = [ 'propertiesPanel', 'translate' ];
