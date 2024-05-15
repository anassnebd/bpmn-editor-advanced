import React from 'react';
import {
  Panel,
  PropertiesGroup,
  PropertiesElement
} from 'bpmn-js-properties-panel';

class CustomServiceTaskPropsPanel extends Panel {
  constructor(props) {
    super(props);
  }

  render() {
    const { element } = this.props;

    // Check if the selected element is a service task
    if (element && element.type === 'bpmn:ServiceTask') {
      return (
        <div>
          <PropertiesGroup title="Custom Service Task Properties">
            <PropertiesElement
              id="customProperty1"
              element={element}
              description="Custom property 1"
              label="Custom Property 1"
              getValue={getValue}
              setValue={setValue}
            />
            {/* Add more custom properties as needed */}
          </PropertiesGroup>
          {/* You can add more PropertiesGroup or PropertiesElement for other properties */}
        </div>
      );
    }

    // Return null if the element is not a service task
    return null;
  }
}

// Define getValue and setValue functions for custom property interaction
function getValue(element) {
  return {
    customProperty1: element.businessObject.get('customProperty1')
  };
}

function setValue(element, values) {
  return {
    customProperty1: values.customProperty1
      ? element.businessObject.set('customProperty1', values.customProperty1)
      : element.businessObject.set('customProperty1', '')
  };
}

export default CustomServiceTaskPropsPanel;
