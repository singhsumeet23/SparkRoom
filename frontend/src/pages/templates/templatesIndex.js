// src/components/templates/templatesIndex.js
import flowchart from "./flowchart.json";
import mindmap from "./mindmap.json";
import wireframe from "./wireframe.json";
import storyboard from "./storyboard.json";

const templates = [
  {
    id: "flowchart",
    name: "Business Flowchart",
    description: "Prebuilt flow for business processes.",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/906/906175.png",
    elements: flowchart.elements,
  },
  {
    id: "mindmap",
    name: "Mind Map",
    description: "Visualize ideas with a structured mind map.",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/2252/2252457.png",
    elements: mindmap.elements,
  },
  {
    id: "wireframe",
    name: "App Wireframe",
    description: "Quick mobile app layout structure.",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/3707/3707008.png",
    elements: wireframe.elements,
  },
  {
    id: "storyboard",
    name: "Storyboard",
    description: "Scene-by-scene creative storyboard layout.",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/1041/1041916.png",
    elements: storyboard.elements,
  },
];

export default templates;
