
treeData = {};
treeData.node = 'ROOT';
treeData.children = [];
nodeInx = 0;

function readTree(tree,treeData)
{
	while((next = tree.shift()) !== undefined)
	{
		if(next == '(')
		{
			treeData.children.push(readTree(tree,{}));
			continue;
		}
		if(next == ')')
		{
			return treeData;
		}
		if(treeData.node === undefined)
		{
			treeData.node = next;
			treeData.children = [];
		}
		else
		{
			treeData.text = next;
			delete treeData.children;
		}
	}
	return treeData;
}


function buildGraph(t,g,c)
{
	g.addNode(nodeInx,{label:t.node, nodeclass:"type-TAG"});
	if(nodeInx > c)
		g.addEdge(null, c, nodeInx);
	nodeInx++;
	
	if(t.children !== undefined)
	{
		c = nodeInx-1;
		for(var i = 0; i < t.children.length; i++)
			buildGraph(t.children[i],g,c);
	}
	else
	{
		g.addNode(nodeInx,{label:t.text, nodeclass:"type-TK"});
		g.addEdge(null, nodeInx-1, nodeInx);
		nodeInx++;
	}
	return g;
}

function draw()
{
    d3.select("svg").remove();
    var attach = d3.select("#attach");
    var svg = attach.append("svg").attr('id','svg-canvas');
    var group = svg.append("g");
	      
    var tree = document.getElementById("sentence").value.replace(/\n|\r/g,'');
	tree = tree.replace(/\(/g,'( ').replace(/\)/g,' )');
	console.log(tree);
	seq = tree.match(/[^ ]+/g);

	treeData = {};
	treeData.node = 'ROOT';
	treeData.children = [];
	nodeInx = 0;
	
	treeStruct = readTree(seq,treeData);
	var g = new dagreD3.Digraph();
	g = buildGraph(treeStruct,g,0);

	var renderer = new dagreD3.Renderer();
	var oldDrawNode = renderer.drawNode();	
	renderer.drawNode(function(graph, u, svg) {
		oldDrawNode(graph, u, svg);
		svg.classed(graph.node(u).nodeclass, true);
	});
	renderer.run(g, group);

	group.attr("transform", "translate(5, 5)");
	svg.call(d3.behavior.zoom().on("zoom", function redraw() {
    group.attr("transform",
      "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
  }));
	return false;
}

