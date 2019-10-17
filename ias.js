function IARandom(grid){
		while(1){
			var t = Math.floor(Math.random()*grid.coordinates.length);
			var x = grid.coordinates[t].x;
			var y = grid.coordinates[t].y;
			if(grid.grid[x][y]==0){
				return {x:x,y:y};
				}
		}
	}

	function barycenter(grid, cells){
		var res=[];
		var bestDistance = 1e8;
		var sumX =0;
		var sumY =0;
		for(var i=0;i<cells.length;i++){
			sumX+=cells[i].x;
			sumY+=cells[i].y;
		}
		sumX/=cells.length;
		sumY/=cells.length;
		for(var i=0; i<grid.length;i++){
			for(var j=0;j<grid[i].length;j++){
					if(grid[i][j]!=0) continue;
					var d = (i-sumX)*(i-sumX)+(j-sumY)*(j-sumY);
					if(d < bestDistance){
						res=[];
						bestDistance=d;
						}
					if(d==bestDistance) res.push({x:i,y:j});
			}
		}
		var r = Math.floor(Math.random()*res.length);
		return res[r];
	}
	
	function getCells(grid, predicate){
		var res = [];
		for(var i=0;i<grid.coordinates.length;i++){
			var x = grid.coordinates[i].x;
			var y = grid.coordinates[i].y;
			
			if(predicate(grid.grid[x][y],grid.coordinates[i])){
				res.push({x:x,y:y});
				}
		}
		return res;
	}
	

function score(grid) {
	var shortestPaths = {1: 1e8, 2: 1e8};
	var visited = grid.initializeVisited();
	for(var i = 0; i < grid.grid.length; i++) {
		for(var j = 0; j < grid.grid[i].length; j++) {
			if(visited[i][j]) continue;
			if(grid.grid[i][j] != 0) {
				grid.dfs(i,j,visited);
			}
			if(grid.grid[i][j] == 1) {
				var djik = grid.dijkstra(i, j, (d)=>{if(d == 0) return 1; if(d == 1) return 0; return 1e8;}, 1);
				var djik2 = grid.dijkstra(i, j, (d)=>{if(d == 0) return 1; if(d == 1) return 0; return 1e8;}, 2);
				shortestPaths[1] = Math.min(shortestPaths[1], djik.d + djik2.d);
				if(djik.d > 1e5) console.log('aie 1');
				if(djik2.d > 1e5) console.log('aie 2');
				
			} else if(grid.grid[i][j] == 2) {
				var djik = grid.dijkstra(i, j, (d)=>{if(d == 0) return 1; if(d == 2) return 0; return 1e8;}, 0);
				var djik2 = grid.dijkstra(i, j, (d)=>{if(d == 0) return 1; if(d == 2) return 0; return 1e8;}, 3);
				if(djik.d > 1e5) console.log('aie 0');
				if(djik2.d > 1e5) console.log('aie 3');
				
				shortestPaths[2] = Math.min(shortestPaths[2], djik.d + djik2.d);
			}
		}
	}
	return  shortestPaths[1] - shortestPaths[2];
}	
	
	
function IAAlphaBeta(grid, player, alpha, beta, depth) {
	if(depth == 0) {
		//console.log(score(grid));
		return {x:0,y:0,s:score(grid)};
	}
	
	var res = {x:0,y:0,s:(player == 1 ? 1e8: -1e8)};
	
	for(var i = 0; i < grid.coordinates.length; i++) {
		var x = grid.coordinates[i].x;
		var y = grid.coordinates[i].y;
		if(grid.grid[x][y] == 0){
			grid.grid[x][y] = player;
			
			if(player == 1) {
				var s = IAAlphaBeta(grid, 2,alpha, beta, depth-1);
				if(s.s <= res.s) {
					res = s;
					res.x = x;
					res.y = y;
				}
				beta = Math.min(beta, res.s);
				grid.grid[x][y] = 0;
				if(alpha >= beta) break;
			} else {
				var s = IAAlphaBeta(grid, 1,alpha, beta, depth-1);
				if(s.s >= res.s){
					res = s;	
					res.x = x;
					res.y = y;
				}
				alpha = Math.max(alpha, res.s);
				
				grid.grid[x][y] = 0;
				if(alpha >= beta) break;
			}
			
			grid.grid[x][y] = 0;
		}
	}
	if(Math.abs(res.s) > 1e5) {
		console.log('alerte au gogol');
	}
	return res;
}
	

	
/*function	IAEnemyBarycenter(grid, player){
		var enemyCells = [];
		for(var i=0;i<grid.coordinates.length;i++){
			if 
		}
	}*/
