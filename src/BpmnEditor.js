import React, { useRef, useEffect, useState } from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-font/dist/css/bpmn-embedded.css";
import { emptyBpmn } from "./asset/empty.bpmn";
import propertiesPanelModule from "bpmn-js-properties-panel-activiti";
import propertiesProviderModule from "bpmn-js-properties-panel-activiti/lib/provider/activiti";
import activitiModdleDescriptor from "activiti-bpmn-moddle/resources/activiti";
import "bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css";
import { Button } from "react-bootstrap";

const BpmnEditor = () => {
  const bpmnContainerRef = useRef(null);
  const [isServiceTask, setIsServiceTask] = useState(false);
  const [elementatorType, setElementatorType] = useState("");
  const [elementatorValue, setElementatorValue] = useState("");
  const [serviceTaskNew, setServiceTaskNew] = useState("");

  let modeler = null;

  useEffect(() => {
    modeler = new BpmnModeler({
      container: bpmnContainerRef.current,
      keyboard: {
        bindTo: window
      },
      propertiesPanel: {
        parent: "#propview"
      },
      additionalModules: [propertiesPanelModule, propertiesProviderModule],
      moddleExtensions: {
        activiti: activitiModdleDescriptor
      }
    });

    // modeler.on("element.click", (event) => {
    //   const element = event.element;
    //   if (element && element.type === "bpmn:ServiceTask") {
    //     setIsServiceTask(true);
    //   } else {
    //     setIsServiceTask(false);
    //   }
    // });
    modeler.on("element.click", (event) => {
      const element = event.element;
      if (element && element.type === "bpmn:ServiceTask") {
        setIsServiceTask(true);
    
        modeler.saveXML({ format: true }, (err, xml) => {
          if (err) {
            console.error("Failed to save BPMN diagram as XML:", err);
            return;
          }
    
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xml, "application/xml");
          const serviceTaskNode = xmlDoc.querySelector(`[id="${element.id}"]`);
          if (!serviceTaskNode) {
            console.error("Service task element not found in the XML.");
            console.log("XML content:", xml); 
            return;
          }
    
          const serviceTaskXML = serviceTaskNode.outerHTML;
          console.log("BPMN XML of the clicked service task:", serviceTaskXML);
          console.log("id : ", element.id); 
          console.log("Name : ", element.Name); 

          setServiceTaskNew(serviceTaskXML)
        });
      } else {
        setIsServiceTask(false);
      }
    });
                

    newBpmnDiagram();

    return () => {
      modeler.destroy();
    };
  }, []);

  const newBpmnDiagram = () => {
    openBpmnDiagram(emptyBpmn);
  };

  const openBpmnDiagram = (xml) => {
    modeler.importXML(xml, (error) => {
      if (error) {
        return console.log("fail import xml");
      }

      const canvas = modeler.get("canvas");
      canvas.zoom("fit-viewport");
    });
  };

  const generateTest = () => {
    // modifyXml(serviceTaskXML);
    console.log(modifyXml(serviceTaskNew));
  }

  const modifyXml = (xmlCode) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlCode, 'text/xml');
    
    const bpmnElements = xmlDoc.getElementsByTagName('bpmn:serviceTask');
    const camundaElements = xmlDoc.getElementsByTagName('camunda:script');
    
    for (let bpmnElement of bpmnElements) {
      bpmnElement.setAttribute('xmlns:activiti', 'http://activiti.org/schema/1.0/bpmn');
      bpmnElement.setAttribute('activiti:asyncBefore', 'true');
      bpmnElement.setAttribute('activiti:class', elementatorValue);
      bpmnElement.setAttribute('activiti:executionListener', '');
      bpmnElement.removeAttribute('xmlns:camunda');
      bpmnElement.removeAttribute('camunda:asyncBefore');
      bpmnElement.removeAttribute('camunda:class');
      bpmnElement.removeAttribute('camunda:executionListener');
    }
    
    
    for (let camundaElement of camundaElements) {
      camundaElement.setAttribute('activiti:script', camundaElement.getAttribute('script'));
      camundaElement.removeAttribute('scriptFormat');
      camundaElement.removeAttribute('resource');
    }

    const serializer = new XMLSerializer();
    const modifiedXmlCode = serializer.serializeToString(xmlDoc);

    return modifiedXmlCode;
  };

  const exportDiagramActivitiBpmn = async () => {
    try {
      if (!modeler) {
        console.error('BPMN modeler instance is not initialized.');
        return;
      }

      const xml = await modeler.saveXML({ format: true });
      const activitiBpmn = convertCamundaToActiviti(xml.xml);

      // xml = convertCamundaToActiviti(xml)
      if (!xml || !xml.xml) {
        console.error('Failed to obtain BPMN XML.');
        return;
      }

      const blob = new Blob([activitiBpmn], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.bpmn';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export diagram:', error);
    }
  };

  const convertCamundaToActiviti = (camundaXml) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(camundaXml, "text/xml");

    const executionListeners = xmlDoc.getElementsByTagName("activiti:executionListener");

    for (let i = 0; i < executionListeners.length; i++) {
      const listener = executionListeners[i];
      const classAttribute = listener.getAttribute("class");
      const undefinedAttribute = listener.getAttribute("undefined");
      
      if (undefinedAttribute && undefinedAttribute.trim() !== "") {
          listener.setAttribute("class", undefinedAttribute.trim());
          listener.removeAttribute("undefined");
      } else {
          listener.parentNode.removeChild(listener);
      }
  }
const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
};
  const exportDiagramActivitiXml = async () => {
    try {
      if (!modeler) {
        console.error('BPMN modeler instance is not initialized.');
        return;
      }

      const xml = await modeler.saveXML({ format: true });

      if (!xml || !xml.xml) {
        console.error('Failed to obtain BPMN XML.');
        return;
      }

      const blob = new Blob([xml.xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export diagram:', error);
    }
  };

  const exportDiagramImage = () => {
    if (!modeler) {
      console.error("BPMN modeler instance is not initialized.");
      return;
    }

    modeler.saveSVG((err, svg) => {
      if (err) {
        console.error("Failed to save BPMN diagram as SVG:", err);
        return;
      }

      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "diagram.svg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const handleTypeChange = (event) => {
    setElementatorType(event.target.value);
  };

  const handleValueChange = (event) => {
    setElementatorValue(event.target.value);
  };

  return (
    <>
      <Button
        onClick={exportDiagramActivitiBpmn}
        variant="primary"
        type="submit"
        style={{ border: "1px solid #008B8B", marginTop: "10px", marginRight: "10px" }}
      >
        Save BPMN
      </Button>

      <Button
        onClick={exportDiagramActivitiXml}
        variant="primary"
        type="submit"
        style={{ border: "1px solid #008B8B", marginTop: "10px", marginRight: "10px" }}
      >
        Save XML
      </Button>
      <Button
        onClick={exportDiagramImage}
        variant="primary"
        type="submit"
        style={{ border: "1px solid #008B8B", marginTop: "10px" }}
      >
        Download BPMN Image
      </Button>
      <Button
        onClick={generateTest}
        variant="primary"
        type="submit"
        style={{ border: "1px solid #008B8B", marginTop: "10px" }}
      >
        Generate T
      </Button>
      
      <div id="TABS-osnld2Uuaf" className="ant-tabs ant-tabs-top ant-tabs-editable ant-tabs-card ant-tabs-editable-card css-14r76du">
        <div id="bpmncontainer">
          <div id="propview" style={{ width: "25%", height: "98vh", float: "right", maxHeight: "98vh", overflowX: "auto", backgroundColor: "#F7F7F7" }}>
            {
              isServiceTask && 
              <div style={{ marginTop: "0px", paddingTop: "10px",display:"block" }}>
                <p>Implementator</p>
                 <select style={{height:"30px",marginLeft:"20px", width:"90%"}} value={elementatorType} onChange={handleTypeChange}>
                  <option value="javaClass">Java Class</option>
                  <option value="delegateExpression">Delegate Expression</option>
                </select>
                <input
                  type="text"
                  placeholder="Value"
                  value={elementatorValue}
                  onChange={handleValueChange}
                  style={{height:"30px",marginTop:"20px",marginLeft:"20px", width:"90%"}}
                />
                {elementatorValue}
              </div>
            }
          </div>

          <div ref={bpmnContainerRef} style={{ width: "75%", height: "98vh", float: "left" }}></div>
        </div>
      </div>
    </>
  );
};

export default BpmnEditor;
