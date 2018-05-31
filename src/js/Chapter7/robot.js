'use strict'

const roads = [
  "Alice's House-Bob's House",   "Alice's House-Cabin",
  "Alice's House-Post Office",   "Bob's House-Town Hall",
  "Daria's House-Ernie's House", "Daria's House-Town Hall",
  "Ernie's House-Grete's House", "Grete's House-Farm",
  "Grete's House-Shop",          "Marketplace-Farm",
  "Marketplace-Post Office",     "Marketplace-Shop",
  "Marketplace-Town Hall",       "Shop-Town Hall"
];

function buildGraph(edges) {
  let graph = Object.create(null);
  function addEdge(from, to) {
    if (graph[from] == null) {
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  }
  for (let [from, to] of edges.map(r => r.split("-"))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}

const roadGraph = buildGraph(roads);

class VilliageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }
  
  move(destination) {
    // If there is no way from the current place to the destination do nothing
    if (!roadGraph[this.place].includes(destination)) {
      return this;
    } else {
      // parcel's .place - where is the parcel now. If it's not where the robot is, do nothing, else we carry the parcel - change its .place to destination, and keep its address unchanged. Then we deliver parcels = remove those that have place == address.
      let parcels = this.parcels.map(p => {
        if (p.place != this.place) return p;
        return {place: destination, address: p.address};
      }).filter(p => p.place != p.address);
      // And return a new state with a place and parcels updated.
      return new VilliageState(destination, parcels);
    }
  }
}

function runRobot(state, robot, memory) {
  for (let turn = 0;; turn ++) {
    if (state.parcels.length == 0) {
      console.log(`Done in ${turn} turns`);
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    console.log(`Move to ${action.direction}`);
  }
}

function randomPick(array) {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

VilliageState.random = function(parcelCount = 5) {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let address = randomPick(Object.keys(roadGraph));
    let place;
    do {
      place = randomPick(Object.keys(roadGraph));
    } while (place == address);
    parcels.push({place, address});
  }
  return new VilliageState("Post Office", parcels);
};

function randomRobot(state) {
  return {direction: randomPick(roadGraph[state.place])};
}

const mailRoute = [
  "Alice's House", "Cabin", "Alice's House", "Bob's House",
  "Town Hall", "Daria's House", "Ernie's House",
  "Grete's House", "Shop", "Grete's House", "Farm",
  "Marketplace", "Post Office"
];

function routeRobot(state, memory) {
  if (memory.length == 0) {
    memory = mailRoute;
  }
  return {direction: memory[0], memory: memory.slice(1)};
}

function findRoute(graph, from, to) {
  let work = [{at: from, route: []}];
  for (let i = 0; i < work.length; i++) {
    let {at, route} = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat(place);
      if (!work.some(w => w.at == place)) {
        work.push({at: place, route: route.concat(place)});
      }
    }
  }
}

function goalOrientedRobot({place, parcels}, route) {
  if (route.length == 0) {
    let parcel = parcels[0];
    if (parcel.place != place) {
      route = findRoute(roadGraph, place, parcel.place);
    } else {
      route = findRoute(roadGraph, place, parcel.address);
    }
  }
  return {direction: route[0], memory: route.slice(1)};
}

function improvedRobot({place, parcels}, route) {
  if (route.length == 0) {
    for (let parcel of parcels) {
      if (parcel.place != place) {
        route = findRoute(roadGraph, place, parcel.place);
        return {direction: route[0], memory: route.slice(1)};
      }
    }
    for (let parcel of parcels) {
      route = findRoute(roadGraph, place, parcel.address);
    }
  }
  return {direction: route[0], memory: route.slice(1)};
}

function improvedRobot2({place, parcels}, route) {
  if (route.length == 0) {
    let carryParcels = [];
    let otherParcels = [];
    for (let parcel of parcels) {
      if (parcel.place == place) {
        carryParcels.push(parcel);
      } else {
        otherParcels.push(parcel);
      }
    }

    let shortestRoute = otherParcels[0] ? 
      findRoute(roadGraph, place, otherParcels[0].place) :
      findRoute(roadGraph, place, carryParcels[0].address);
    for (let carryParcel of carryParcels) {
      let addrRoute = findRoute(roadGraph, place, carryParcel.address);
      if (addrRoute.length < shortestRoute.length) {
        shortestRoute = addrRoute;
      }
    }
    for (let otherParcel of otherParcels) {
      let placeRoute = findRoute(roadGraph, place, otherParcel.place);
      if (placeRoute.length < shortestRoute.length) {
        shortestRoute = placeRoute;
      }
    }
    route = shortestRoute;
  }
  return {direction: route[0], memory: route.slice(1)};
}

function improvedRobot3({place, parcels}, route) {
  if (route.length == 0) {
    let carryParcels = [];
    let otherParcels = [];
    for (let parcel of parcels) {
      if (parcel.place == place) {
        carryParcels.push(parcel);
      } else {
        otherParcels.push(parcel);
      }
    }

    let shortestRoute = otherParcels[0] ? 
      findRoute(roadGraph, place, otherParcels[0].place) :
      findRoute(roadGraph, place, carryParcels[0].address);
    for (let carryParcel of carryParcels) {
      let addrRoute = findRoute(roadGraph, place, carryParcel.address);
      if (addrRoute.length < shortestRoute.length) {
        shortestRoute = addrRoute;
      }
    }
    for (let otherParcel of otherParcels) {
      let placeRoute = findRoute(roadGraph, place, otherParcel.place);
      if (placeRoute.length <= shortestRoute.length) {
        shortestRoute = placeRoute;
      }
    }
    route = shortestRoute;
  }
  return {direction: route[0], memory: route.slice(1)};
}

function lazyRobot({place, parcels}, route) {
  if (route.length == 0) {
    // Describe a route for every parcel
    let routes = parcels.map(parcel => {
      if (parcel.place != place) {
        return {route: findRoute(roadGraph, place, parcel.place),
                pickUp: true};
      } else {
        return {route: findRoute(roadGraph, place, parcel.address),
                pickUp: false};
      }
    });

    // This determines the precedence a route gets when choosing.
    // Route length counts negatively, routes that pick up a package
    // get a small bonus.
    function score({route, pickUp}) {
      return (pickUp ? 0.5 : 0) - route.length;
    }
    route = routes.reduce((a, b) => score(a) > score(b) ? a : b).route;
  }

  return {direction: route[0], memory: route.slice(1)};
}


function compareRobots(robot1, memory1, robot2, memory2) {
  let total1 = 0; let total2 = 0;
  for (let i = 0; i < 100; ++i) {
    let task = VilliageState.random();    
    total1 += measureTurns(task, robot1, memory1);
    total2 += measureTurns(task, robot2, memory2);    
  }
  console.log(`First robot has ${total1 / 100} average turns, ` +
  `second robot has ${total2 / 100} average turns.`);
}

function measureTurns(state, robot, memory) {
  for (let turn = 0;; turn++) {
    if (state.parcels.length == 0) return turn;
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
  }
}

compareRobots(randomRobot,       [], routeRobot,     []);
compareRobots(goalOrientedRobot, [], improvedRobot,  []);
compareRobots(improvedRobot,     [], improvedRobot2, []);
compareRobots(improvedRobot2,    [], improvedRobot3, []);
compareRobots(improvedRobot3,    [], lazyRobot,      []);