import {Injectable} from '@angular/core';
import {Node, Link, ForceDirectedGraph} from './';
import * as d3 from 'd3';
import {NodeService} from "./models/node.service";

@Injectable()
export class D3Service {
  /** This service will provide methods to enable user interaction with elements
   * while maintaining the d3 simulations physics
   */
 // @Output() nodeClicked: EventEmitter<Node> = new EventEmitter<Node>();

  constructor(
    private nodeService : NodeService
  ) {  }

  /** A method to bind a pan and zoom behaviour to an svg element */
  applyZoomableBehaviour(svgElement, containerElement) {
    let svg, container, zoomed, zoom;

    svg = d3.select(svgElement);
    container = d3.select(containerElement);

    zoomed = () => {
      let transform = d3.event.transform;
      container.attr("transform", "translate(" + transform.x + "," + transform.y + ") scale(" + transform.k + ")");
    };

    zoom = d3.zoom().on("zoom", zoomed);
    svg.call(zoom);
  }

  /** A method to bind a draggable behaviour to an svg element */
  applyDraggableBehaviour(element, node: Node, graph: ForceDirectedGraph) {
    let d3element = d3.select(element);

    function started() {
      if (!d3.event.active) {
        graph.simulation.alphaTarget(0.3).restart();
      }

      d3.event.on("drag", dragged).on("end", ended);

      function dragged() {
        node.fx = d3.event.x;
        node.fy = d3.event.y;
      }

      function ended() {
        if (!d3.event.active) {
          graph.simulation.alphaTarget(0);
        }

        node.fx = null;
        node.fy = null;
      }
    }

    d3element.call(d3.drag()
      .on("start", started));
  }


  /** A method to bind hoverable behaviour to an svg element */
  applyHoverableBehaviour(element, node: Node) {
    let d3element = d3.select(element);
    d3element.on("mouseover", function (d) {
      d3element.select("circle").classed("hovering", true);
    });

    d3element.on("mouseout", function (d) {
      d3element.select("circle").classed("hovering", false);
    });
  }


 /** A method to bind click events to an svg element */
 //just emits the node for other components to listen for
  applyClickableBehaviour = (element, node: Node) =>  {
    let clickedNode = {};
    let d3element = d3.select(element);
    d3element.on("click",function(d) {
      console.log(clickedNode);
      if (node == clickedNode) {
        console.log("already clicked dummy");
      } else {
        d3element.select("circle").classed("clicked", true);
        this.nodeService.changeNode(node);
        clickedNode = node;
      }
    }.bind(this));
  };


  /** The interactable graph we will simulate in this article
   * This method does not interact with the document, purely physical calculations with d3
   */
  getForceDirectedGraph(nodes: Node[], links: Link[], options: {width, height}) {
    let sg = new ForceDirectedGraph(nodes, links, options);
    console.log(sg);
    return sg;
  }
}