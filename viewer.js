function readTree(tree, treeData) {
    while ((next = tree.shift()) !== undefined) {
        if (next == '(') {
            treeData.children.push(readTree(tree, {}));
            continue;
        }
        if (next == ')') {
            return treeData;
        }
        if (treeData.node === undefined) {
            treeData.node = next;
            treeData.children = [];
        }
        else {
            treeData.text = next;
            delete treeData.children;
        }
    }
    return treeData;
}


function buildGraph(nodeIdx, parentIdx, tree, g) {
    g.setNode(nodeIdx, {label: tree.node, class: "type-TAG"});
    
    if(nodeIdx > parentIdx) {
        g.setEdge(parentIdx, nodeIdx, {lineInterpolate: 'basis'});
    }
    
    nodeIdx++;

    if (tree.children !== undefined) {
        parentIdx = nodeIdx - 1;
        for (var i = 0; i < tree.children.length; i++)
            nodeIdx = buildGraph(nodeIdx, parentIdx, tree.children[i], g);
    }
    else {
        g.setNode(nodeIdx, {label: tree.text, class: "type-TK"});
        console.log(tree.text);
        g.setEdge(nodeIdx - 1, nodeIdx, {lineInterpolate: 'basis' });
        nodeIdx++;
    }
    return nodeIdx;
}

function draw() {

    var tree = document.getElementById("sentence").value.replace(/\n|\r/g, '');
    tree = tree.replace(/\(/g, '( ').replace(/\)/g, ' )');
    var seq = tree.match(/[^ ]+/g),
        treeData = {};
    
    treeData.node = 'ROOT';
    treeData.children = [];
    readTree(seq, treeData);

    // Create the input graph
    var g = new dagreD3.graphlib.Graph()
        .setGraph({})
        .setDefaultEdgeLabel(function () {
            return {};
        });

    buildGraph(0, 0, treeData, g);
    console.log(treeData);
    console.log(g);
    
    delete g._nodes.null;

    // Create the renderer
    var render = new dagreD3.render();

    // Set up an SVG group so that we can translate the final graph.
    d3.select("svg").remove();
    var attach = d3.select("#attach");
    var svg = attach.append("svg").attr('id','svg-canvas');
        svgGroup = svg.append("g");

    // Set up zoom support
    var zoom = d3.behavior.zoom().on("zoom", function() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")" +
        "scale(" + d3.event.scale + ")");
    });
    svg.call(zoom);
    
    // Run the renderer. This is what draws the final graph.
    render(d3.select("svg g"), g);

    // Center the graph
    //var xCenterOffset = (svg.attr("width") - g.graph().width) / 2;
    //svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
    //svg.attr("height", g.graph().height + 40);
    
    return false;
}

