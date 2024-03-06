# note

right now the doc is still unstructured. There's no categorization yet. we just put it here right away, and structure them based on heading.

# Main structure

![lofi main page](extras/image.png)

here's the primary structure visualized. the software visualization on the left, inside a canvas. everything on right will change the way the visualization is drawn (the configurations).

the visualization is drawn as a graph.

# how the svg is drawn

we use a container


# the flow of the program

there are four steps (each abstracted as a function) in the program flow, which is inside the `scr/routes/+page.svelte` file.

1. converter

2. createGraphData
in here, we start to care about the variable stored in the memory. things got referenced here. 

3. filter
4. draw

the program will do this sequntially. but not always taking on every step.

for example, if the drawSettings is change, then it will only do the fourth step. if the rawData is changed, then it will start from the first step.

there are multiple inputs for the program.

1. rawData
2. filterConfig
3. drawSettings
why are the configurations and the steps seperated this way?

the easiest option is to rerender the whole thing from the start everytime a config is change (no mather what config it is). this will redraw the whole graph, everytime the config is changed.

1.  first this is ineffiecient.
2.  second, this will flash the screen each time something is changed. this will lead to bad user experience.




exception, on first draw filter will be skipped. because there's no data to filter yet. filter also uses the injected graphData. which is not done yet. it will be done after the draw function is called.


filter will 



# non destructive
filter can change the condition of the graphData. for example, it can collapse the node so that they're not rendered.

at first, we were doing this desctructively. so we recreate the whole graphData everytime time the filter is changed. 

but this will lead to bad user experience. the screen will flash everytime the filter is changed.


# structure of convertedData
we can't decide the strucuture of rawData, but we can decide the structure of graphData.


## first iteration
first, we try seperating the data into three part. 



## second iteration
second iteration we make them nested.