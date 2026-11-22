let allPokemon = [];
let allNames = [];
let pokemonTypes = [
"Bug",
"Dark",
"Dragon",
"Electric",
"Fairy",
"Fighting",
"Fire",
"Flying",
"Ghost",
"Grass",
"Ground",
"Ice",
"Normal",
"Poison",
"Psychic",
"Rock",
"Steel",
"Water"
];
let page = 1; 
let pageSize = 52;
let totalPages = Number(localStorage.getItem("totalPages")) || 999;
let retryAction = null;

let filterType = document.getElementById("filter");
let pokemonSearch = document.getElementById("search");
let grid = document.getElementById("grid");
let loadBtn = document.getElementById("loadmore");
let modal = document.getElementById("modal");
let modalContent = document.getElementById("modalContent");
let closeBtn = document.getElementById("closeModal");
let prevBtn = document.getElementById("prev");
let nextBtn = document.getElementById("next");
let pageNum = document.getElementById("pageNum");
let nav = document.getElementById("nav");

// card display
function makeCard(p){
  let card = document.createElement("div");
  card.className = "card";
  let cardTitle = document.createElement("h3");
  cardTitle.textContent = p.name;
  card.appendChild(cardTitle);
   let pokeImg = document.createElement("img");
    setImage(pokeImg, p.image);
  pokeImg.loading = "lazy";
    card.appendChild(pokeImg);
 

  // Badge loop Display or something
for (let j = 0; j < p.types.length; j++) {
  let badge = document.createElement("span");
  badge.textContent = p.types[j];
  badge.className = "type " + p.types[j];
  card.appendChild(badge);
}
  card.addEventListener("click", () => showDetails(p));
  return card;
}

function renderCards(list){
  grid.innerHTML = " "
  if (list.length === 0) {
    let emptyMsg = document.createElement("h2");
    emptyMsg.className = "empty";
    emptyMsg.textContent = "This lil guy doesn't exist yet";
    grid.appendChild(emptyMsg);
    return
  }
  for (let l = 0; l < list.length; l++) {
   let cards = makeCard(list[l]);
    grid.appendChild(cards);
  }
}

function showError(retryFn) {
  retryAction = retryFn;
  grid.innerHTML = "";
  let err = document.createElement("div");
  err.className = "loading";
  let msg = document.createElement("p");
  msg.textContent = "Couldn't load pokemons :(               Try checking your connection";
  let retry = document.createElement("button");
  retry.className = "err-btn"
  retry.textContent = "Try again";
  retry.addEventListener("click", retryFn);
  err.appendChild(msg);
  err.appendChild(retry);
  grid.appendChild(err);
}

// pokenon URL / API data
function loadPokemon(url) {
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      allPokemon.push(buildPokemon(data));
      allPokemon.sort((a, b) => a.id - b.id);
    });
}
    function buildPokemon(data) {
      
   // pokemon names
    let typeNames = [];

for (let k = 0; k < data.types.length; k++) {
  typeNames.push(data.types[k].type.name);
}
      
    //pokemon stats
    let statList = [];
    for (let k = 0; k < data.stats.length; k++) {
     statList.push({ 
      name: data.stats[k].stat.name,
      value: data.stats[k].base_stat
      })
    }
    
  // pokemon abilities
    let abilityList = [];
    for (let a = 0; a < data.abilities.length; a++) {
  abilityList.push(data.abilities[a].ability.name);
    }
      //pokemom info/data
  return {
  name: data.name,
  types: typeNames,
  id: data.id,
  stats: statList,
  abilities: abilityList,
  height: data.height, 
  weight: data.weight,
  speciesUrl: data.species.url,
  animated: data.sprites.other.showdown.front_default,
  image: data.sprites.other["official-artwork"].front_default,
  image2: data.sprites.front_default
};
     // console.log(realPokemon);
    // for those intrested, this shows all the available pokemon images you can experiment with :D
 // console.log(data.sprites);
  };

 function showLoading() {
  grid.innerHTML = "";
  let box = document.createElement("div");
  box.className = "loading";
  box.innerHTML = "<div class='spinner'></div><p>Loading pokemon...</p>";
  grid.appendChild(box);
 }
// load more button
function loadPage() {
  allPokemon = [];
  pageNum.textContent = "Page " + page;
  prev.hidden = (page === 1);
    let saved = localStorage.getItem("page-" + page);
if (saved) {
  allPokemon = JSON.parse(saved);
  nextBtn.disabled = (page >= totalPages);
  applyFilters();
  return
}
  nextBtn.disabled = true;
  showLoading();
  
   fetch(`https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=${(page - 1) * pageSize}`)
    .then(response => response.json())
    .then(data => {
      totalPages = Math.ceil(data.count / pageSize);
      localStorage.setItem("totalPages", totalPages);
      
      let promises = [];
      for (let i = 0; i < data.results.length; i++) {
        promises.push(loadPokemon(data.results[i].url));
      }
    return  Promise.all(promises);
    })
        .then(() => {
          retryAction = null;
          applyFilters();
          localStorage.setItem("page-" + page, JSON.stringify(allPokemon));
        })
        .catch((error) => {
          console.log(error);
          showError(loadPage);
        })
  .finally(() => {
  nextBtn.disabled = (page >= totalPages)
    });
}

// Navigation Handling

nextBtn.addEventListener("click", () => {
  if (page >= totalPages) return;
  page++;
  loadPage();
  window.scrollTo(0, 0);
});

prevBtn.addEventListener("click", ()=>{
  page-- ;
  loadPage();
  window.scrollTo(0, 0);
})

closeBtn.addEventListener("click",  () =>{
    modal.classList.remove("open");
  })

function loadNames() {
  let saved = localStorage.getItem("allNames");
  if (saved) {
    allNames = JSON.parse(saved);
    return
  }
  
  fetch("https://pokeapi.co/api/v2/pokemon?limit=2000")
  .then(response => response.json())
  .then(data => {
    allNames = data.results;
    localStorage.setItem("allNames", JSON.stringify(allNames));
  })
}
loadPage();
loadNames();

function runSearch() {
  let text = pokemonSearch.value.toLowerCase();
  if (text === "") {
nav.style.display = "";
    loadPage();
    return
  } else{
    nav.style.display = "none";
  }
  showLoading();
  allPokemon = [];
  let matches = [];

  for (let x = 0; x < allNames.length; x++) {
    let n = allNames[x];
    if (n.name.includes(text)) { 
      matches.push(n); 
    }
    if (matches.length >= 20) { 
      break; 
    }
  }

  let promises = [];
  for (let t = 0; t < matches.length; t++) {
    promises.push(loadPokemon(matches[t].url))
  }
  Promise.all(promises)
  .then(() => { 
    let retryAction = null;
    applyFilters();
  })
  .catch((error) => {
      console.log(error);
      showError(runSearch);
    });
}

// search bar & Dropdown
function applyFilters() {
 let text = pokemonSearch.value.toLowerCase();
  let selectedType = filterType.value;
  let filtered = [];
  
  for (let s = 0; s < allPokemon.length; s++) {
    let p = allPokemon[s];
   if (p.name.includes(text) && (selectedType === "all" || p.types.includes(selectedType) )) { 
  filtered.push(p);
}
  }
  renderCards(filtered);
} 
 filterType.addEventListener("change", applyFilters); 
let searchTimer;
pokemonSearch.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(runSearch, 400);
});
 // pokemonSearch.addEventListener("input", applyFilters);

// filter
function addFilter() {
  for (let f = 0; f < pokemonTypes.length; f++) {
    let newFilter = document.createElement("option");
    newFilter.textContent = pokemonTypes[f];
    filterType.appendChild(newFilter);
    newFilter.value = pokemonTypes[f].toLowerCase();
  }
}
addFilter();

// modal display, badge and info
function showDetails(p){
modal.scrollTo(0, 0);
  
  modalContent.innerHTML = "";
  modal.classList.add("open");

  // image
  let modalImg = document.createElement("img");
  modalImg.className = "detail-img animated";
  setImage(modalImg, p.animated || p.image);
  modalContent.appendChild(modalImg);

  // name
  let modalName = document.createElement("h2");
  modalName.className = "detail-name";
  modalName.textContent = p.name;
  modalContent.appendChild(modalName);

  // type badges
  let detailTypes = document.createElement("div");
  detailTypes.className = "detail-types";
  for (let m = 0; m < p.types.length; m++) {
    let modalBadge = document.createElement("span");
    modalBadge.textContent = p.types[m];
    modalBadge.className = "type " + p.types[m];
    detailTypes.appendChild(modalBadge);
  }
  modalContent.appendChild(detailTypes);

  // stats
  let modalStats = document.createElement("div");
  modalStats.className = "stats";
  for (let n = 0; n < p.stats.length; n++) {
    modalStats.appendChild(makeStatRow(p.stats[n]));
  }
  modalContent.appendChild(modalStats);

  // size
  let sizeLabel = " ";
   if (p.height <= 10) {
    sizeLabel = "Small"
  } else if (p.height <= 20){
    sizeLabel = "Medium"
  } else{
    sizeLabel = "Big Guy"
   }
  let infoRow = document.createElement("div");
  infoRow.className = "info-row";
  
  let infoWeight = document.createElement("div");
  infoWeight.className = "info-row";
  infoWeight.textContent = "Weight: " + (p.weight / 10)  + "kg";
  infoRow.appendChild(infoWeight);

  let infoHeight = document.createElement("div");
  infoHeight.className = "info-row";
  infoHeight.textContent = "Height: " + (p.height / 10) + "m";
  infoRow.appendChild(infoHeight);

  let infoSize = document.createElement("div");
  infoSize.textContent = "Size: " + sizeLabel
  infoSize.className = "info-row";
  infoRow.appendChild(infoSize);
  modalContent.appendChild(infoRow);
  
  
  let evoBox = document.createElement("div");
  evoBox.textContent = "Loading evolutions...";
evoBox.className = "evo-box";
modalContent.appendChild(evoBox);
  
  //abilities 
  let detailBox = document.createElement("div");
  detailBox.className = "detail-box";
  let modalAbilities = document.createElement("div");
  modalAbilities.className = "abilities";
  for (let b = 0; b < p.abilities.length; b++) {
    let displayAbility = document.createElement("span")
   displayAbility.textContent = p.abilities[b].replaceAll("-", " ")
    modalAbilities.appendChild(displayAbility);
  }
  let abilityTag = document.createElement("h4");
  abilityTag.textContent = "ABILITIES ";
  detailBox.appendChild(abilityTag);  
detailBox.appendChild(modalAbilities);   
modalContent.appendChild(detailBox);    

  // pokemon description
    let pokeDes = document.createElement("div");
    pokeDes.className = "detail-box";
    let loadTxt = document.createElement("p");
    loadTxt.className = "description";
    loadTxt.textContent = "Loading...";
    pokeDes.appendChild(loadTxt);
    modalContent.appendChild(pokeDes);

    fetch(p.speciesUrl)
    .then(response => response.json())
    .then(data => {
      for (let y = 0; y < data.flavor_text_entries.length; y++) {
        let entry = data.flavor_text_entries[y];
        if (entry.language.name === "en") {
          loadTxt.textContent = entry.flavor_text.replace(/\s+/g, " ");
          break;
        }
      }

      // evo row
      return fetch(data.evolution_chain.url)
        .then(response => response.json())
        .then(chainData => {
          let evoNames = [];
          collectNames(chainData.chain, evoNames);

          let evoFetches = [];
          for (let v = 0; v < evoNames.length; v++) {
            evoFetches.push(
              fetch(`https://pokeapi.co/api/v2/pokemon/${evoNames[v]}`)
                .then(response => response.json())
                .then(d => ({ key: evoNames[v], pokemon: buildPokemon(d) }))
                .catch((error) => {
                  console.log(error);
                  return { key: evoNames[v], pokemon: null };
                })
            );
          }

          return Promise.all(evoFetches).then(results => {
            let imageByName = {};
            let pokemonByName = {};
            for (let u = 0; u < results.length; u++) {
              let r = results[u];
              imageByName[r.key] = r.pokemon ? r.pokemon.image : "";
              pokemonByName[r.key] = r.pokemon;
            }
            evoBox.textContent = "";
            evoBox.appendChild(buildTree(chainData.chain, imageByName, pokemonByName));
          });
        })
        .catch((error) => {
          console.log(error);
          evoBox.textContent = "Evolutions unavailable";
        });
    })
    .catch((error) => {
      console.log(error);
      loadTxt.textContent = "description unavailable";
      evoBox.textContent = "Evolutions unavailable";
    });
} // end of showDetails
      function collectNames(stage, list) {
  list.push(stage.species.name);   
  for (let e = 0; e < stage.evolves_to.length; e++) {
    collectNames(stage.evolves_to[e], list );  
  }
      }

let statLabels = {
  "hp": "HP",
  "attack": "ATK",
  "defense": "DEF",
  "special-attack": "SP-ATK",
  "special-defense": "SP-DEF",
  "speed": "SPD"
};

//modal stats
function makeStatRow(stat) {
  let row = document.createElement("div");
  let rowSpan = document.createElement("span");
  let bar = document.createElement("div");
  let fillBar = document.createElement("div");
  let value = document.createElement("span");
  
  row.className = "stat";
  rowSpan.className = "stat-label";
  bar.className = "bar";
  fillBar.className = "fill";
  value.className = "stat-value"

  bar.appendChild(fillBar);
  fillBar.style.width = (stat.value / 255 * 100) + "%";
  row.appendChild(rowSpan);
  row.appendChild(bar);
  row.appendChild(value);

  rowSpan.textContent = statLabels[stat.name];
  value.textContent = stat.value;
  return row;
}

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.remove("open");
  }
});

let placeholderImg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' rx='12' fill='%232b2b2b'/><text x='48' y='62' font-size='44' text-anchor='middle' fill='%236e6e6e'>?</text></svg>";

function setImage(img, url) {
  img.onerror = () => {
    img.onerror = null;
    img.src = placeholderImg;
  };
  img.src = url || placeholderImg;
}

function makeEvoNode(name, images, pokemons) {
  let evoItem = document.createElement("div");
  evoItem.className = "evo-item";
  
  let evoNodeImg = document.createElement("img");
  setImage(evoNodeImg, images[name]);
  
  let evoNodeSpan = document.createElement("span");
  evoNodeSpan.textContent = name;
  
  evoItem.appendChild(evoNodeImg);
  evoItem.appendChild(evoNodeSpan);

  
  if (pokemons[name]) {
  evoItem.classList.add("clickable");
  evoItem.addEventListener("click", () => showDetails(pokemons[name]));
  }

  return evoItem;
}

function buildTree(stage, images, pokemons) {
  let wrapper = document.createElement("div");
  wrapper.className = "evo-stage";
  wrapper.appendChild(makeEvoNode(stage.species.name, images, pokemons)); 

  if (stage.evolves_to.length > 0) {
    let evoArrow = document.createElement("span");
    evoArrow.className = "evo-arrow";
    evoArrow.textContent = "→"
    wrapper.appendChild(evoArrow);

    let evoBranches = document.createElement("div");
    evoBranches.className = "evo-branches";

    for (let h = 0; h < stage.evolves_to.length; h++) {
      let branch = buildTree(stage.evolves_to[h], images, pokemons);
      evoBranches.appendChild(branch);
    }
    wrapper.appendChild(evoBranches);
  }
  return wrapper;
}
window.addEventListener("online", () => {
  if (retryAction) {
    retryAction();
  }
});