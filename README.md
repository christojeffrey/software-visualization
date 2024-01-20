# software-visualization

This is a program that will visualize software architecture. It's going to be a web app, using **d3.js** as the visualization library and **svelte** as the framework.

# Diction Conventions

1. we're going to call it **vertex (singular) and vertices (plural); and edge (singular) and edges (plural)**. D3 prefer to call it node and links. But just for consistency, we're going to call it vertex and edge, rooting back to Graph Theory.

# Program Flow

![Alt text](image.png)

# Data Conventions

based on program flow above, we can see some data that is used in the program, namely:

1. rawData
2. convertedData
3. config
4. graphData
5. drawSettings

## rawData

rawData is a json file, based on [this](https://github.com/rsatrioadi/classviz/tree/main/data). No reasoning here, it's just the data that we are provided with.

## convertedData

this is the format that **we** prefer to work with, instead of rawData. It actually halfway to graphData, without the data injection and reference linking. In here we're just dealing with value. Making it possible to export to json, though not needed yet.

Converted data is **not mutable** unless the rawData is changed. This is shown in the diagram. The config to the left of this data has to change in order to change this data.

here is the type for convertedData

```typescript
type ConvertedDataType = {
  vertices: Vertex[];
  edges: Edge[];
  groups: Group[];
};
type VertexType = {
  id: string;
  level: number;
};
type EdgeType = {
  source: string;
  target: string;
  type: string;
};
```

explanation.

id is required by d3 as this is the identifier for the vertex. level is used to help 'lifting'

here is the example of it

## graphData

this is the format that **d3** prefers to work with.
d3 like to do 'injection', inserting data into the data that we provided. It's going to be done here, in graphData. so graphData is going to be changed by d3.

---

# features

on top of the relatively basic or must have features, here are the feature that we're going to implement.

edge lifting.

edge bundling.

vertex collapsing.
