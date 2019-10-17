var N = 11;
var cellSize = 20;
var PI = Math.acos(-1);

class Grid {
    constructor() {
        this.grid = [];
        this.coordinates = [];
        this.iaToPlay = false;
        this.grid2 = [];
		this.computedNeighbors = {};
		
        for (var i = 1; i <= N; i++) {
            var row = [];
            var row2 = [];
            for (var j = 1; j <= i; j++) {
                row.push(0);
                row2.push({});
                this.coordinates.push({ x: i - 1, y: j - 1 });
            }
            this.grid.push(row);
            this.grid2.push(row2);
        }
        for (var i = N - 1; i >= 1; i--) {
            var row = [];
            var row2 = [];

            for (var j = 1; j <= i; j++) {
                row.push(0);
                row2.push({});
                this.coordinates.push({ x: N + N - i - 1, y: j - 1 });
            }
            this.grid.push(row);
            this.grid2.push(row2);
        }
        this.svg = d3.select("body").append("svg")
        var handleClick = this.handleClick.bind(this);
        this.svg.on('click', function (d) {
            var coords = d3.mouse(this);
            handleClick(coords);
        });
        this.container = this.svg.append('g');
        for (var i = 0; i < this.coordinates.length; i++) {
            this.coordinates[i].centerX = this.coordinates[i].x * Math.cos(PI / 2 - PI / 3) * cellSize + 100;
            var middle = this.grid[this.coordinates[i].x].length / 2;
            var delta = this.coordinates[i].y - Math.floor(middle);
            if (this.grid[this.coordinates[i].x].length % 2 == 0) {
                delta = (this.coordinates[i].y * 2 >= this.grid[this.coordinates[i].x].length ? this.coordinates[i].y - (middle - 1) : this.coordinates[i].y - (middle));
                this.coordinates[i].centerY = delta * (Math.sin(PI / 2) * 2 + Math.sin(PI / 2 - PI / 3) * 2) * cellSize + 350;
                if (this.coordinates[i].y * 2 >= this.grid[this.coordinates[i].x].length) {
                    this.coordinates[i].centerY -= (Math.sin(PI / 2) + Math.sin(PI / 2 - PI / 3)) * cellSize;
                } else {
                    this.coordinates[i].centerY += (Math.sin(PI / 2) + Math.sin(PI / 2 - PI / 3)) * cellSize;
                }
            } else {
                this.coordinates[i].centerY = 2 * delta * Math.sin(PI / 2) * cellSize + 350;
                this.coordinates[i].centerY += (Math.sin(PI / 2 - PI / 3)) * 2 * delta * cellSize;
            }
            this.grid2[this.coordinates[i].x][this.coordinates[i].y].centerX = this.coordinates[i].centerX;
            this.grid2[this.coordinates[i].x][this.coordinates[i].y].centerY = this.coordinates[i].centerY;

        }
        this.hexagons = {};
    }


    neighbors(x, y) {
		
		if(this.computedNeighbors[x] && this.computedNeighbors[x][y]) return this.computedNeighbors[x][y];
		if(!this.computedNeighbors[x]) this.computedNeighbors[x] = {};
		
        var res = [];
        for (var i = -3; i <= 3; i++) {
            for (var j = -3; j <= 3; j++) {
                var x2 = x + i;
                var y2 = y + j;
                if (i == 0 && j == 0) continue;
                if (x2 >= 0 && x2 < this.grid.length && y2 >= 0 && y2 < this.grid[x2].length) {
                    var points1 = [];
                    var points2 = [];
                    for (var k = 0; k < 6; k++) {
                        points1.push({ x: this.grid2[x2][y2].centerX + Math.cos(PI / 2 + (k) * (PI / 3)) * cellSize, y: this.grid2[x2][y2].centerY + Math.sin(PI / 2 + (k) * (PI / 3)) * cellSize });
                        points2.push({ x: this.grid2[x][y].centerX + Math.cos(PI / 2 + (k) * (PI / 3)) * cellSize, y: this.grid2[x][y].centerY + Math.sin(PI / 2 + (k) * (PI / 3)) * cellSize });
                    }
                    var count = 0;
                    for (var k = 0; k < points1.length; k++) {
                        for (var l = 0; l < points2.length; l++) {
                            if (Math.abs(points1[k].x - points2[l].x) < 1e-6 && Math.abs(points1[k].y - points2[l].y) < 1e-6) {
                                count++;
                            }
                        }
                    }
                    if (count >= 2) {
                        res.push({ x: x2, y: y2 });
                    }
                }
            }
        }
		this.computedNeighbors[x][y] = res;
        return res;
    }

    handleClick(p) {
        if (this.iaToPlay || this.ended) {
            return;
        }
        
        var bestElem = { x: -1, y: -1 };
        var x = p[0];
        var y = p[1];
        var bestDist = 1e8;
        for (var i = 0; i < this.coordinates.length; i++) {
            var d = Math.sqrt((this.coordinates[i].centerX - x) * (this.coordinates[i].centerX - x) + (this.coordinates[i].centerY - y) * (this.coordinates[i].centerY - y));
            if (d <= cellSize && bestDist > d) {
                bestElem.x = this.coordinates[i].x;
                bestElem.y = this.coordinates[i].y;
                bestDist = d;
            }
        }
        if (bestElem.x == -1) {
            return;
        }
		if(this.grid[bestElem.x][bestElem.y] != 0){
			return;
		}
        this.grid[bestElem.x][bestElem.y] = 2;
		
		this.iaToPlay = true;
        if (this.winner() != 0) {
            this.draw();
            this.ended = true;
            return;
        } else {
            var pt = IAAlphaBeta(this,1,-1e8, 1e8,3);
			console.log(pt);
            this.grid[pt.x][pt.y] = 1;
            if (this.winner() != 0) {
                this.draw();
                this.ended = true;
                return;
            }
            this.iaToPlay = false;
        }
        this.draw();
    }

    dfs(x, y, visited) {
        var res = [];
        var q = [{ x: x, y: y }];
        visited[x][y] = true;
        while (q.length) {
            var current = q.splice(q.length - 1, 1)[0];
            var n = this.neighbors(current.x, current.y);
            res.push(current);
            n.forEach((node) => {
                if (!visited[node.x][node.y] && this.grid[current.x][current.y] == this.grid[node.x][node.y]) {
                    visited[node.x][node.y] = true;
                    q.push(node);
                }
            });
        }
        return res;
    }
	
	initializeVisited() {
		var visited = new Array(this.grid.length);
        for (var i = 0; i < this.grid.length; i++) {
            visited[i] = new Array(this.grid[i].length).fill(false);
        }
		return visited;
	}
	
	dijkstra(x, y, costs, sideIdx) {
		if(!this.dijkstraVisited) {
			this.dijkstraVisited = this.initializeVisited();
		}
		
		for(var i = 0; i < this.grid.length; i++) {
			for(var j = 0; j < this.grid[i].length; j++) {
				this.dijkstraVisited[i][j] = -1;
			}
		}
		
		var queue = new TinyQueue([],(noeud1, noeud2)=>{
			return noeud1.d - noeud2.d;
		});
		queue.push({d:0,x:x,y:y});
		this.dijkstraVisited[x][y] = 0;
		var current = {};
		while(queue.length){
			current = queue.pop();
			
			if(current.x <= N-1 && current.y == this.grid[current.x].length-1 && sideIdx == 0){
				break;
			}
			if(current.x <= N-1 && current.y == 0 && sideIdx == 1){
				break;
			}
			if(current.x >= N-1 && current.y == this.grid[current.x].length-1 && sideIdx == 2){
				break;
			}
			if(current.x >= N-1 && current.y == 0 && sideIdx == 3){
				break;
			}
			
			var n = this.neighbors(current.x,current.y);
			n.forEach((newNode)=>{
				if(this.dijkstraVisited[newNode.x][newNode.y] == -1){
					//backtrack[newNode.x][newNode.y] = current;
					newNode.d = current.d + costs(this.grid[newNode.x][newNode.y]);
					this.dijkstraVisited[newNode.x][newNode.y] = newNode.d;
					
					queue.push(newNode);
				}
			});
		}
		if(current.d > 1e5){
			console.log('?');
		}
		return current;
	}

    winner() {
        var visited = this.initializeVisited();
        for (var i = 0; i < this.grid.length; i++) {
            for (var j = 0; j < this.grid[i].length; j++) {
                if (!visited[i][j] && this.grid[i][j] != 0) {
                    var nodes = this.dfs(i, j, visited);

                    var mask = 0;
                    for (var k = 0; k < nodes.length; k++) {
                        var case1 = nodes[k].y == 0 && nodes[k].x <= N - 1;
                        var case2 = nodes[k].y == this.grid[nodes[k].x].length - 1 && nodes[k].x <= N - 1;
                        var case3 = nodes[k].y == 0 && nodes[k].x >= N - 1;
                        var case4 = nodes[k].y == this.grid[nodes[k].x].length - 1 && nodes[k].x >= N - 1;

                        if (case1 && this.grid[i][j] == 1) {
                            mask |= 1;
                        }
                        if (case2 && this.grid[i][j] == 2) {
                            mask |= 1;
                        }
                        if (case3 && this.grid[i][j] == 2) {
                            mask |= 2;
                        }
                        if (case4 && this.grid[i][j] == 1) {
                            mask |= 2;
                        }
                    }
                    if (mask == 3) {
                        for (var k = 0; k < nodes.length; k++) {
                            this.grid[nodes[k].x][nodes[k].y] |= 4;
                        }
                        return this.grid[i][j];
                    }
                }
            }
        }
        return 0;
    }

    draw() {
        for (var i = 0; i < 6; i++) {
            this.hexagons[i] = this.container
                .selectAll('.hexagon' + i)
                .data(this.coordinates)
                .enter()
                .append('line')
                .attr('class', 'hexagon' + i)
                .attr('x1', (d) => {
                    return d.centerX + Math.cos(PI / 2 + i * (PI / 3)) * cellSize;
                })
                .attr('y1', (d) => {
                    return d.centerY + Math.sin(PI / 2 + i * (PI / 3)) * cellSize;
                })
                .attr('x2', (d) => {
                    return d.centerX + Math.cos(PI / 2 + (i + 1) * (PI / 3)) * cellSize;
                })
                .attr('y2', (d) => {
                    return d.centerY + Math.sin(PI / 2 + (i + 1) * (PI / 3)) * cellSize;
                })
                .attr('stroke', (d)=>{
					d.special = true;
					if(i==0){
						if(d.y+1 == this.grid[d.x].length && d.x <= N-1){
							return 'red';
						} 
					} else if(i==1) {
						if(d.y == 0 && d.x <= N-1){
							return 'blue';
						} else if(d.y+1 == this.grid[d.x].length && d.x <= N-1){
							return 'red';
						} 
					} else if(i==2) {
						if(d.y == 0 && d.x <= N-1){
							return 'blue';
						} 
					} else if(i==3) {
						if(d.y == 0 && d.x >= N-1){
							return 'red';
						} 
					} else if(i==4) {
						if(d.y == 0 && d.x >= N-1){
							return 'red';
						} else if(d.y+1 == this.grid[d.x].length && d.x >= N-1){
							return 'blue';
						}
					} else if(i==5) {
						if(d.y+1 == this.grid[d.x].length && d.x >= N-1){
							return 'blue';
						}
					}
					d.special = false;
					return 'black';
				})
                .attr('stroke-width', (d)=>{
						if(d.special) return '2px';
						else return '1px';
				})
                ;
        }
        this.container.selectAll('.circle')
            .data(this.coordinates)
            .enter()
            .append('circle')
            .attr('class', 'circle');

        this.circles = this.container.selectAll('.circle');
        this.circles.data(this.coordinates);
        this.circles
            .attr('cx', (d) => {
                return d.centerX;
            })
            .attr('cy', (d) => {
                return d.centerY;
            })
            .attr('r', (d) => {
                return 0.75*cellSize;
            })
            .attr('stroke', (d) => {
                if (this.grid[d.x][d.y] == 0) {
                    return 'none';
                } else if (this.grid[d.x][d.y] & 1) {
                    return 'blue';
                } else if (this.grid[d.x][d.y] & 2) {
                    return 'red';
                }
            })
			.attr('stroke-width',2)
            .attr('fill', (d) => {
                if (this.grid[d.x][d.y] == 0) {
                    return 'none';
                } else if (this.grid[d.x][d.y] == 1) {
                    return 'blue';
                } else if (this.grid[d.x][d.y] == 2) {
                    return 'red';
                }
                if (this.grid[d.x][d.y] & 4) {
                    return 'yellow';
                }
            });

    }

};



function player() {

}

var G = new Grid();
G.draw();

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

