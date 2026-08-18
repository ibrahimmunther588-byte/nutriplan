let toastTimer;
function showToast(msg){
  const toast = document.getElementById('toast');
  document.getElementById('toastText').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove('show'), 2200);
}

function wait(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

function hashStr(s){
  let h=0;
  for(let i=0;i<s.length;i++){ h=(h*31+s.charCodeAt(i))>>>0; }
  return h;
}

/* ====================================================================
   IMAGE FALLBACK HELPER
   For recipes beyond the first 20 local images (or any broken local
   image), pull a relevant photo from the web automatically using the
   recipe name as a keyword — no need to manually upload 220 images.
   ==================================================================== */
function fallbackImageUrl(name){
  const keywords = (name || 'food').split(' ').slice(0,2).join(',');
  return `https://loremflickr.com/400/300/${encodeURIComponent(keywords)},food`;
}

function getNutrition(r){
  const h = hashStr(r.name);
  return {
    calories: 320 + (h % 480),
    protein: 15 + (h % 35),
    carbs: 20 + ((h>>3) % 60),
    fat: 8 + ((h>>5) % 35),
    servings: 1 + (h % 4)
  };
}

function dateKey(d){
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function todayKey(){ return dateKey(new Date()); }

function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

function escapeHTML(value){
  if(value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cuisineLabel(c){
  const map = {egyptian:"Egypt",lebanese:"Lebanon",indian:"India",italian:"Italy",moroccan:"Morocco",turkish:"Turkey",japanese:"Japan",mexican:"Mexico",greek:"Greece",thai:"Thailand"};
  return map[c] || c;
}
function typeLabel(t){
  const map = {beef:"Beef",chicken:"Chicken",dessert:"Dessert",lamb:"Lamb",misc:"Miscellaneous",pasta:"Pasta",pork:"Pork",seafood:"Seafood",side:"Side",starter:"Starter",vegan:"Vegan",vegetarian:"Vegetarian"};
  return map[t] || t;
}


/* ====================================================================
   1. PAGE: MEALS & RECIPES
   ==================================================================== */

const RECIPES = [
  {name:"Classic Beef Burger", type:"beef", cuisine:"egyptian", img:"images/1.jpg", desc:"Prepare the Classic Beef Burger and get everything measured out, then start cooking over medium heat until fragrant..."},
  {name:"Beef Shawarma Plate", type:"beef", cuisine:"lebanese", img:"images/2.jpg", desc:"Season the Beef Shawarma Plate well and let it come to room temperature before it goes into the pan..."},
  {name:"Beef Stroganoff", type:"beef", cuisine:"indian", img:"images/3.jpg", desc:"Heat a splash of oil in a wide pan, then add the Beef Stroganoff and cook gently, stirring now and then..."},
  {name:"Grilled Beef Steak", type:"beef", cuisine:"italian", img:"images/4.jpg", desc:"Bring a pot of water to a boil, then work on the Grilled Beef Steak while it comes up to temperature..."},
  {name:"Beef Wellington", type:"beef", cuisine:"moroccan", img:"images/5.jpg", desc:"Combine the Beef Wellington with the aromatics in a bowl, mixing everything together evenly..."},
  {name:"Korean Beef Bulgogi", type:"beef", cuisine:"turkish", img:"images/6.jpg", desc:"Marinate the Korean Beef Bulgogi for a few minutes so the flavors have time to soak in properly..."},
  {name:"Beef Tacos", type:"beef", cuisine:"japanese", img:"images/7.jpg", desc:"Preheat the oven and line a tray, then arrange the Beef Tacos in a single even layer..."},
  {name:"Slow-Cooked Beef Brisket", type:"beef", cuisine:"mexican", img:"images/8.jpg", desc:"Chop the ingredients for the Slow-Cooked Beef Brisket finely, keeping everything roughly the same size..."},
  {name:"Beef Stir-Fry", type:"beef", cuisine:"greek", img:"images/9.jpg", desc:"Whisk together the base for the Beef Stir-Fry until smooth, then set it aside briefly..."},
  {name:"Beef Rendang", type:"beef", cuisine:"thai", img:"images/10.jpg", desc:"Layer the Beef Rendang in a dish, building it up in stages so every bite is balanced..."},
  {name:"Beef Meatballs", type:"beef", cuisine:"egyptian", img:"images/11.jpg", desc:"Simmer the Beef Meatballs gently over low heat, stirring occasionally so nothing sticks..."},
  {name:"Peppered Beef Steak", type:"beef", cuisine:"lebanese", img:"images/12.jpg", desc:"Toss the Peppered Beef Steak in the seasoning blend, coating every piece evenly before cooking..."},
  {name:"Beef Kebab", type:"beef", cuisine:"indian", img:"images/13.jpg", desc:"Grill the Beef Kebab over a hot flame, turning once a nice char has formed..."},
  {name:"Beef Ragu", type:"beef", cuisine:"italian", img:"images/14.jpg", desc:"Fold the Beef Ragu together carefully, keeping the texture light and airy..."},
  {name:"Beef Chili", type:"beef", cuisine:"moroccan", img:"images/15.jpg", desc:"Rest the Beef Chili briefly after cooking, which helps the flavors settle before serving..."},
  {name:"Beef Empanadas", type:"beef", cuisine:"turkish", img:"images/16.jpg", desc:"Prepare the Beef Empanadas and get everything measured out, then start cooking over medium heat until fragrant..."},
  {name:"Teriyaki Beef Skewers", type:"beef", cuisine:"japanese", img:"images/17.jpg", desc:"Season the Teriyaki Beef Skewers well and let it come to room temperature before it goes into the pan..."},
  {name:"Beef Bourguignon", type:"beef", cuisine:"mexican", img:"images/18.jpg", desc:"Heat a splash of oil in a wide pan, then add the Beef Bourguignon and cook gently, stirring now and then..."},
  {name:"Beef Fajitas", type:"beef", cuisine:"greek", img:"images/19.jpg", desc:"Bring a pot of water to a boil, then work on the Beef Fajitas while it comes up to temperature..."},
  {name:"Spiced Beef Kofta", type:"beef", cuisine:"thai", img:"images/20.jpg", desc:"Combine the Spiced Beef Kofta with the aromatics in a bowl, mixing everything together evenly..."},
  {name:"Butter Chicken Curry", type:"chicken", cuisine:"egyptian", img:"images/21.jpg", desc:"Prepare the Butter Chicken Curry and get everything measured out, then start cooking over medium heat until fragrant..."},
  {name:"Honey Garlic Wings", type:"chicken", cuisine:"lebanese", img:"images/22.jpg", desc:"Season the Honey Garlic Wings well and let it come to room temperature before it goes into the pan..."},
  {name:"Chicken Fattah", type:"chicken", cuisine:"indian", img:"images/23.jpg", desc:"Heat a splash of oil in a wide pan, then add the Chicken Fattah and cook gently, stirring now and then..."},
  {name:"Chicken Shawarma", type:"chicken", cuisine:"italian", img:"images/24.jpg", desc:"Bring a pot of water to a boil, then work on the Chicken Shawarma while it comes up to temperature..."},
  {name:"Lemon Herb Roast Chicken", type:"chicken", cuisine:"moroccan", img:"images/25.jpg", desc:"Combine the Lemon Herb Roast Chicken with the aromatics in a bowl, mixing everything together evenly..."},
  {name:"Chicken Tikka Masala", type:"chicken", cuisine:"turkish", img:"images/26.jpg", desc:"Marinate the Chicken Tikka Masala for a few minutes so the flavors have time to soak in properly..."},
  {name:"Crispy Fried Chicken", type:"chicken", cuisine:"japanese", img:"images/27.jpg", desc:"Preheat the oven and line a tray, then arrange the Crispy Fried Chicken in a single even layer..."},
  {name:"Chicken Parmesan", type:"chicken", cuisine:"mexican", img:"images/28.jpg", desc:"Chop the ingredients for the Chicken Parmesan finely, keeping everything roughly the same size..."},
  {name:"Teriyaki Chicken Bowl", type:"chicken", cuisine:"greek", img:"images/29.jpg", desc:"Whisk together the base for the Teriyaki Chicken Bowl until smooth, then set it aside briefly..."},
  {name:"Chicken Fajitas", type:"chicken", cuisine:"thai", img:"images/30.jpg", desc:"Layer the Chicken Fajitas in a dish, building it up in stages so every bite is balanced..."},
  {name:"Chicken Biryani", type:"chicken", cuisine:"egyptian", img:"images/31.jpg", desc:"Simmer the Chicken Biryani gently over low heat, stirring occasionally so nothing sticks..."},
  {name:"BBQ Chicken Skewers", type:"chicken", cuisine:"lebanese", img:"images/32.jpg", desc:"Toss the BBQ Chicken Skewers in the seasoning blend, coating every piece evenly before cooking..."},
  {name:"Chicken Alfredo", type:"chicken", cuisine:"indian", img:"images/33.jpg", desc:"Grill the Chicken Alfredo over a hot flame, turning once a nice char has formed..."},
  {name:"General Tso's Chicken", type:"chicken", cuisine:"italian", img:"images/34.jpg", desc:"Fold the General Tso's Chicken together carefully, keeping the texture light and airy..."},
  {name:"Chicken Caesar Wrap", type:"chicken", cuisine:"moroccan", img:"images/35.jpg", desc:"Rest the Chicken Caesar Wrap briefly after cooking, which helps the flavors settle before serving..."},
  {name:"Chicken Katsu", type:"chicken", cuisine:"turkish", img:"images/36.jpg", desc:"Prepare the Chicken Katsu and get everything measured out, then start cooking over medium heat until fragrant..."},
  {name:"Peri Peri Chicken", type:"chicken", cuisine:"japanese", img:"images/37.jpg", desc:"Season the Peri Peri Chicken well and let it come to room temperature before it goes into the pan..."},
  {name:"Chicken Enchiladas", type:"chicken", cuisine:"mexican", img:"images/38.jpg", desc:"Heat a splash of oil in a wide pan, then add the Chicken Enchiladas and cook gently, stirring now and then..."},
  {name:"Coq au Vin", type:"chicken", cuisine:"greek", img:"images/39.jpg", desc:"Bring a pot of water to a boil, then work on the Coq au Vin while it comes up to temperature..."},
  {name:"Chicken Satay", type:"chicken", cuisine:"thai", img:"images/40.jpg", desc:"Combine the Chicken Satay with the aromatics in a bowl, mixing everything together evenly..."},
  {name:"Chocolate Lava Cake", type:"dessert", cuisine:"egyptian", img:"images/41.jpg", desc:"Prepare the Chocolate Lava Cake and get everything measured out, then start cooking over medium heat until fragrant..."},
  {name:"Mango Sticky Rice", type:"dessert", cuisine:"lebanese", img:"images/42.jpg", desc:"Season the Mango Sticky Rice well and let it come to room temperature before it goes into the pan..."},
  {name:"Classic Tiramisu", type:"dessert", cuisine:"indian", img:"images/43.jpg", desc:"Heat a splash of oil in a wide pan, then add the Classic Tiramisu and cook gently, stirring now and then..."},
  {name:"New York Cheesecake", type:"dessert", cuisine:"italian", img:"images/44.jpg", desc:"Bring a pot of water to a boil, then work on the New York Cheesecake while it comes up to temperature..."},
  {name:"Creme Brulee", type:"dessert", cuisine:"moroccan", img:"images/45.jpg", desc:"Combine the Creme Brulee with the aromatics in a bowl, mixing everything together evenly..."},
  {name:"Baklava", type:"dessert", cuisine:"turkish", img:"images/46.jpg", desc:"Marinate the Baklava for a few minutes so the flavors have time to soak in properly..."},
  {name:"Apple Pie", type:"dessert", cuisine:"japanese", img:"images/47.jpg", desc:"Preheat the oven and line a tray, then arrange the Apple Pie in a single even layer..."},
  {name:"Tres Leches Cake", type:"dessert", cuisine:"mexican", img:"images/48.jpg", desc:"Chop the ingredients for the Tres Leches Cake finely, keeping everything roughly the same size..."},
  {name:"Basbousa", type:"dessert", cuisine:"greek", img:"images/49.jpg", desc:"Whisk together the base for the Basbousa until smooth, then set it aside briefly..."},
  {name:"Panna Cotta", type:"dessert", cuisine:"thai", img:"images/50.jpg", desc:"Layer the Panna Cotta in a dish, building it up in stages so every bite is balanced..."},
  {name:"Churros with Chocolate Sauce", type:"dessert", cuisine:"egyptian", img:"images/51.jpg", desc:"Simmer the Churros gently over low heat, stirring occasionally so nothing sticks..."},
  {name:"Red Velvet Cupcakes", type:"dessert", cuisine:"lebanese", img:"images/52.jpg", desc:"Toss the Red Velvet Cupcakes in the seasoning blend, coating every piece evenly before cooking..."},
  {name:"Kunafa", type:"dessert", cuisine:"indian", img:"images/53.jpg", desc:"Grill the Kunafa over a hot flame, turning once a nice char has formed..."},
  {name:"Lemon Tart", type:"dessert", cuisine:"italian", img:"images/54.jpg", desc:"Fold the Lemon Tart together carefully, keeping the texture light and airy..."},
  {name:"Rice Pudding", type:"dessert", cuisine:"moroccan", img:"images/55.jpg", desc:"Rest the Rice Pudding briefly after cooking, which helps the flavors settle before serving..."},
  {name:"Chocolate Chip Cookies", type:"dessert", cuisine:"turkish", img:"images/56.jpg", desc:"Prepare the Chocolate Chip Cookies and get everything measured out, then start cooking over medium heat until fragrant..."},
  {name:"Um Ali", type:"dessert", cuisine:"japanese", img:"images/57.jpg", desc:"Season the Um Ali well and let it come to room temperature before it goes into the pan..."},
  {name:"Peanut Butter Brownies", type:"dessert", cuisine:"mexican", img:"images/58.jpg", desc:"Heat a splash of oil in a wide pan, then add the Peanut Butter Brownies and cook gently, stirring now and then..."},
  {name:"Baked Alaska", type:"dessert", cuisine:"greek", img:"images/59.jpg", desc:"Bring a pot of water to a boil, then work on the Baked Alaska while it comes up to temperature..."},
  {name:"Pistachio Baklava Rolls", type:"dessert", cuisine:"thai", img:"images/60.jpg", desc:"Combine the Pistachio Baklava Rolls with the aromatics in a bowl, mixing everything together evenly..."},
  {name:"Grilled Lamb Kofta", type:"lamb", cuisine:"egyptian", img:"images/61.jpg", desc:"Prepare the Grilled Lamb Kofta and get everything measured out, then start cooking over medium heat until fragrant..."},
  {name:"Moroccan Lamb Tagine", type:"lamb", cuisine:"lebanese", img:"images/62.jpg", desc:"Season the Moroccan Lamb Tagine well and let it come to room temperature before it goes into the pan..."},
  {name:"Roast Leg of Lamb", type:"lamb", cuisine:"indian", img:"images/63.jpg", desc:"Heat a splash of oil in a wide pan, then add the Roast Leg of Lamb and cook gently, stirring now and then..."},
  {name:"Lamb Kebab", type:"lamb", cuisine:"italian", img:"images/64.jpg", desc:"Bring a pot of water to a boil, then work on the Lamb Kebab while it comes up to temperature..."},
  {name:"Lamb Rogan Josh", type:"lamb", cuisine:"moroccan", img:"images/65.jpg", desc:"Combine the Lamb Rogan Josh with the aromatics in a bowl, mixing everything together evenly..."},
  {name:"Slow-Roasted Lamb Shoulder", type:"lamb", cuisine:"turkish", img:"images/66.jpg", desc:"Marinate the Slow-Roasted Lamb Shoulder for a few minutes so the flavors have time to soak in properly..."},
  {name:"Vegetable Dumplings", type:"vegetarian", cuisine:"thai", img:"images/240.jpg", desc:"Combine the Vegetable Dumplings with the aromatics in a bowl, mixing everything together evenly..."},
];

let state = { search:"", cuisine:"all", type:"all", view:"grid" };

const grid = document.getElementById('recipeGrid');
const countEl = document.getElementById('recipeCount');
const emptyState = document.getElementById('emptyState');

function getFilteredRecipes(){
  const q = state.search.trim().toLowerCase();
  return RECIPES.filter(r=>{
    const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.cuisine.includes(q) || r.type.includes(q);
    const matchesCuisine = state.cuisine === "all" || r.cuisine === state.cuisine;
    const matchesType = state.type === "all" || r.type === state.type;
    return matchesSearch && matchesCuisine && matchesType;
  });
}

function render(){
  const filtered = getFilteredRecipes();

  countEl.textContent = filtered.length;
  grid.innerHTML = "";

  if(filtered.length === 0){
    emptyState.classList.remove('d-none');
    grid.classList.add('d-none');
    return;
  }
  emptyState.classList.add('d-none');
  grid.classList.remove('d-none');

  filtered.forEach((r, idx)=>{
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.style.animation = `fadeUp .4s ease ${idx*0.03}s both`;
    card.innerHTML = `
      <div class="recipe-img">
        <img src="${r.img}" alt="${r.name}"
             onerror="this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='flex';}; this.src='${fallbackImageUrl(r.name)}';">
        <div class="img-placeholder">
          <i class="bi bi-image"></i>
          <span>Add photo<br>${r.img}</span>
        </div>
        <div class="badge-row">
          <span class="badge-pill badge-cat"><i class="bi bi-tag-fill"></i> ${typeLabel(r.type)}</span>
          <span class="badge-pill badge-cuisine"><i class="bi bi-globe2"></i> ${cuisineLabel(r.cuisine)}</span>
        </div>
      </div>
      <div class="recipe-body">
        <h3 class="recipe-title">${r.name}</h3>
        <p class="recipe-desc">${r.desc}</p>
        <div class="recipe-footer">
          <span><i class="bi bi-egg-fried"></i> ${typeLabel(r.type)}</span>
          <span><i class="bi bi-globe2"></i> ${cuisineLabel(r.cuisine)}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  document.querySelectorAll('.recipe-card').forEach((card, idx)=>{
    card.addEventListener('click', ()=> openRecipeDetail(filtered[idx]));
  });
}

document.getElementById('searchInput').addEventListener('input', e=>{
  state.search = e.target.value;
  render();
});

document.getElementById('cuisineScroll').addEventListener('click', e=>{
  const pill = e.target.closest('.pill');
  if(!pill) return;
  document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
  pill.classList.add('active');
  state.cuisine = pill.dataset.cuisine;
  render();
});

document.getElementById('mealtypeGrid').addEventListener('click', e=>{
  const card = e.target.closest('.mealtype-card');
  if(!card) return;
  const already = card.classList.contains('active');
  document.querySelectorAll('.mealtype-card').forEach(c=>c.classList.remove('active'));
  if(already){
    state.type = "all";
  } else {
    card.classList.add('active');
    state.type = card.dataset.type;
  }
  render();
});

document.getElementById('clearFilter').addEventListener('click', ()=>{
  state = { search:"", cuisine:"all", type:"all", view:state.view };
  document.getElementById('searchInput').value = "";
  document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
  document.querySelector('.pill[data-cuisine="all"]').classList.add('active');
  document.querySelectorAll('.mealtype-card').forEach(c=>c.classList.remove('active'));
  render();
});

document.getElementById('gridBtn').addEventListener('click', ()=>{
  state.view = 'grid';
  grid.classList.remove('list-mode');
  document.getElementById('gridBtn').classList.add('active');
  document.getElementById('listBtn').classList.remove('active');
});
document.getElementById('listBtn').addEventListener('click', ()=>{
  state.view = 'list';
  grid.classList.add('list-mode');
  document.getElementById('listBtn').classList.add('active');
  document.getElementById('gridBtn').classList.remove('active');
});


/* ====================================================================
   2. PAGE: RECIPE DETAIL
   ==================================================================== */

const MAIN_INGREDIENT = {
  beef:"Beef", chicken:"Chicken", lamb:"Lamb", pork:"Pork",
  seafood:"Shrimp", pasta:"Pasta", vegan:"Chickpeas", vegetarian:"Paneer",
  dessert:"Flour", side:"Potatoes", starter:"Filo Pastry", misc:"Mixed Fruits"
};

const EXTRA_INGREDIENTS = [
  ["5 thinly sliced","Onion"], ["8 cloves chopped","Garlic"], ["2 finely chopped","Tomatoes"],
  ["1 tbsp","Ginger paste"], ["2 tsp","Cumin seeds"], ["3 tsp","Coriander seeds"],
  ["1 tsp","Turmeric powder"], ["1 tsp","Chilli powder"], ["2","Green chilli"],
  ["1 cup","Yogurt"], ["¾ cup","Cream"], ["3 tsp","Dried fenugreek"],
  ["1 tsp","Garam masala"], ["To taste","Salt"], ["¼ cup","Vegetable oil"],
  ["2 tbsp","Butter"], ["1","Lemon, juiced"], ["1 tsp","Black pepper"],
  ["2","Bay leaves"], ["1 cup","Grated cheese"], ["1 tbsp","Soy sauce"],
  ["1 tsp","Paprika"], ["½ cup","Chopped parsley"], ["2 tbsp","Honey"]
];

function generateIngredients(recipe){
  const h = hashStr(recipe.name);
  const count = 12 + (h % 5);
  const mainAmount = ["1.2 kg","900 g","1.5 kg","700 g","1 kg"][h % 5];
  const list = [{qty: mainAmount, name: MAIN_INGREDIENT[recipe.type] || "Main ingredient"}];
  for(let i=0;i<count-1;i++){
    const item = EXTRA_INGREDIENTS[(h+i*7) % EXTRA_INGREDIENTS.length];
    list.push({qty:item[0], name:item[1]});
  }
  return list;
}

const STEP_TEMPLATES = (mainIng, name) => [
  `Take a large pot or wok, big enough to cook everything, and heat the oil in it. Once hot, add the sliced onion and fry until deep golden brown. Take it out and set aside.`,
  `To the same pot, add the chopped garlic and sauté for a minute. Then add the chopped tomatoes and cook until soft, about 5 minutes.`,
  `Return the fried onion to the pot and stir. Add the ginger paste and sauté well.`,
  `Add the cumin seeds, half of the coriander seeds and chopped green chillies. Give them a quick stir.`,
  `Next goes in the spices — turmeric powder and chilli powder. Sauté the spices well for a couple of minutes.`,
  `Add the ${mainIng} to the pot, season with salt to taste, and cook covered on medium-low heat until almost done, about 15 minutes.`,
  `When the oil separates from the spices, add the beaten yogurt keeping the heat on lowest so it doesn't split. Sprinkle the remaining coriander seeds and half the dried fenugreek leaves. Mix well.`,
  `Finally add the cream and give a final mix to combine everything well.`,
  `Sprinkle the remaining garam masala and serve the ${name} hot with rice or bread. Enjoy!`
];

function generateInstructions(recipe){
  const mainIng = (MAIN_INGREDIENT[recipe.type] || "main ingredient").toLowerCase();
  const steps = STEP_TEMPLATES(mainIng, recipe.name);
  const h = hashStr(recipe.name);
  const count = 7 + (h % 3);
  const chosen = [steps[0], steps[1]];
  for(let i=2;i<steps.length-1 && chosen.length<count-1;i++){
    if((h+i) % 2 === 0 || chosen.length < count-2) chosen.push(steps[i]);
  }
  chosen.push(steps[steps.length-1]);
  return chosen;
}

document.getElementById('ingredientsList').addEventListener('click', e=>{
  const item = e.target.closest('.ingredient-item');
  if(!item) return;
  item.classList.toggle('checked');
});

let currentRecipe = null;

async function openRecipeDetail(recipe){
  currentRecipe = recipe;
  const n = getNutrition(recipe);

  document.getElementById('detailHeroImg').src = recipe.img;
  document.getElementById('detailHeroImg').alt = recipe.name;
  document.getElementById('detailHeroImg').onerror = function(){
    this.onerror = null;
    this.src = fallbackImageUrl(recipe.name);
  };
  document.getElementById('detailTitle').textContent = recipe.name;
  document.getElementById('instructionsList').innerHTML =
    `<li><div class="step-num">1</div><div class="step-text">Loading recipe details...</div></li>`;
  showPage('detail');

  /* calculating state ON */
  const logBtn = document.getElementById('logMealBtn');
  logBtn.classList.add('calculating');
  logBtn.disabled = true;
  logBtn.innerHTML = `<i class="bi bi-arrow-repeat spin-icon"></i> Calculating...`;
  document.getElementById('nutritionCalculating').classList.add('show');
  document.getElementById('nutritionContent').classList.add('hide');

  document.getElementById('detailBadgeType').innerHTML = `<i class="bi bi-tag-fill"></i> ${typeLabel(recipe.type)}`;
  document.getElementById('detailBadgeCuisine').innerHTML = `<i class="bi bi-globe2"></i> ${cuisineLabel(recipe.cuisine)}`;
  document.getElementById('detailTime').textContent = `${15 + (hashStr(recipe.name)%45)} min`;
  document.getElementById('detailServings').textContent = `${n.servings} servings`;
  document.getElementById('detailCalPerServing').textContent = `${n.calories} cal/serving`;

  document.getElementById('nutCalories').textContent = n.calories;
  document.getElementById('nutCaloriesTotal').textContent = `Total: ${n.calories * n.servings} cal`;
  document.getElementById('nutProtein').textContent = `${n.protein} g`;
  document.getElementById('nutCarbs').textContent = `${n.carbs} g`;
  document.getElementById('nutFat').textContent = `${n.fat} g`;
  document.getElementById('nutFiber').textContent = `${2+(hashStr(recipe.name)%8)} g`;
  document.getElementById('nutSugar').textContent = `${3+(hashStr(recipe.name)%18)} g`;
  document.getElementById('nutSatFat').textContent = `${2+(hashStr(recipe.name)%10)} g`;
  document.getElementById('nutCholesterol').textContent = `${20+(hashStr(recipe.name)%140)} mg`;
  document.getElementById('nutSodium').textContent = `${200+(hashStr(recipe.name)%800)} mg`;
  document.getElementById('fillProtein').style.width = Math.min(100,n.protein*2)+'%';
  document.getElementById('fillCarbs').style.width = Math.min(100,n.carbs)+'%';
  document.getElementById('fillFat').style.width = Math.min(100,n.fat*2)+'%';
  document.getElementById('fillFiber').style.width = '40%';
  document.getElementById('fillSugar').style.width = '35%';
  document.getElementById('fillSatFat').style.width = '30%';

  let apiMeal = null;
  try{
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(recipe.name)}`);
    const data = await res.json();
    if(data.meals && data.meals.length){
      apiMeal = data.meals[0];
    }
  }catch(e){ /* fall back to generated data */ }

  if(apiMeal){
    document.getElementById('detailHeroImg').src = apiMeal.strMealThumb;

    const ingredients = [];
    for(let i=1;i<=20;i++){
      const ing = apiMeal[`strIngredient${i}`];
      const measure = apiMeal[`strMeasure${i}`];
      if(ing && ing.trim()) ingredients.push({qty: measure && measure.trim() ? measure.trim() : '', name: ing.trim()});
    }
    document.getElementById('ingredientsCount').textContent = `${ingredients.length} items`;
    document.getElementById('ingredientsList').innerHTML = ingredients.map(ing => `
      <div class="ingredient-item">
        <div class="chk"><i class="bi bi-check-lg"></i></div>
        <div class="ing-text"><b>${ing.qty}</b> ${ing.name}</div>
      </div>
    `).join('');
    document.getElementById('ingredientsCard').classList.remove('d-none');

    const steps = apiMeal.strInstructions.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    document.getElementById('instructionsList').innerHTML = steps.map((s,i)=>`
      <li><div class="step-num">${i+1}</div><div class="step-text">${s}</div></li>
    `).join('');

    if(apiMeal.strYoutube){
      document.getElementById('videoThumbImg').src = apiMeal.strMealThumb;
      document.getElementById('videoTitleBadge').textContent = apiMeal.strMeal;
      document.getElementById('videoThumb').href = apiMeal.strYoutube;
      document.getElementById('videoCard').classList.remove('d-none');
    } else {
      document.getElementById('videoCard').classList.add('d-none');
    }
  } else {
    const ingredients = generateIngredients(recipe);
    document.getElementById('ingredientsCount').textContent = `${ingredients.length} items`;
    document.getElementById('ingredientsList').innerHTML = ingredients.map(ing => `
      <div class="ingredient-item">
        <div class="chk"><i class="bi bi-check-lg"></i></div>
        <div class="ing-text"><b>${ing.qty}</b> ${ing.name}</div>
      </div>
    `).join('');
    document.getElementById('ingredientsCard').classList.remove('d-none');

    const steps = generateInstructions(recipe);
    document.getElementById('instructionsList').innerHTML = steps.map((s, i) => `
      <li><div class="step-num">${i+1}</div><div class="step-text">${s}</div></li>
    `).join('');

    document.getElementById('videoThumbImg').src = recipe.img;
    document.getElementById('videoThumbImg').onerror = function(){
      this.onerror = null;
      this.src = fallbackImageUrl(recipe.name);
    };
    document.getElementById('videoTitleBadge').textContent = recipe.name;
    document.getElementById('videoThumb').href =
      `https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.name + ' recipe')}`;
    document.getElementById('videoCard').classList.remove('d-none');
  }

  /* artificial delay so the "calculating" state is visible for a moment */
  await wait(3200);

  /* calculating state OFF */
  logBtn.classList.remove('calculating');
  logBtn.disabled = false;
  logBtn.innerHTML = `<i class="bi bi-clipboard2-check-fill"></i> Log This Meal`;
  document.getElementById('nutritionCalculating').classList.remove('show');
  document.getElementById('nutritionContent').classList.remove('hide');
}

document.getElementById('backToRecipes').addEventListener('click', ()=> showPage('meals'));


/* ====================================================================
   3. LOG MEAL MODAL + SUCCESS MODAL
   ==================================================================== */

let modalServings = 1;

function openLogModal(){
  if(!currentRecipe) return;
  modalServings = 1;
  document.getElementById('logModalImg').src = currentRecipe.img;
  document.getElementById('logModalImg').onerror = function(){
    this.onerror = null;
    this.src = fallbackImageUrl(currentRecipe.name);
  };
  document.getElementById('logModalName').textContent = currentRecipe.name;
  updateModalNutrition();
  document.getElementById('logMealModal').classList.add('show');
}

function closeLogModal(){
  document.getElementById('logMealModal').classList.remove('show');
}

function updateModalNutrition(){
  document.getElementById('servingsValue').textContent = modalServings;
  const n = getNutrition(currentRecipe);
  document.getElementById('modalCalories').textContent = n.calories * modalServings;
  document.getElementById('modalProtein').textContent = (n.protein * modalServings) + 'g';
  document.getElementById('modalCarbs').textContent = (n.carbs * modalServings) + 'g';
  document.getElementById('modalFat').textContent = (n.fat * modalServings) + 'g';
}

document.getElementById('logMealBtn').addEventListener('click', openLogModal);
document.getElementById('logModalCancel').addEventListener('click', closeLogModal);
document.getElementById('logMealModal').addEventListener('click', e=>{
  if(e.target.id === 'logMealModal') closeLogModal();
});
document.getElementById('servingsMinus').addEventListener('click', ()=>{
  if(modalServings > 1){ modalServings--; updateModalNutrition(); }
});
document.getElementById('servingsPlus').addEventListener('click', ()=>{
  if(modalServings < 10){ modalServings++; updateModalNutrition(); }
});
document.getElementById('logModalConfirm').addEventListener('click', ()=>{
  if(!currentRecipe) return;
  const n = getNutrition(currentRecipe);
  const totalCal = n.calories * modalServings;

  logMeal(currentRecipe, modalServings);
  closeLogModal();
  showSuccessModal(currentRecipe.name, modalServings, totalCal);
});

function showSuccessModal(name, servings, calories){
  document.getElementById('successMsg').innerHTML =
    `${name} (${servings} serving${servings>1?'s':''}) has been added to your daily log.`;
  document.getElementById('successCalories').textContent = `+${calories} calories`;
  document.getElementById('successModal').classList.add('show');

  setTimeout(()=>{
    document.getElementById('successModal').classList.remove('show');
  }, 1200);
}


/* ====================================================================
   4. PAGE: FOOD LOG
   ==================================================================== */

const GOALS = { calories:2000, protein:50, carbs:250, fat:65 };

function loadLog(){
  try{ return JSON.parse(localStorage.getItem('nutriplan_log') || '{}'); }
  catch(e){ return {}; }
}
function saveLog(log){
  localStorage.setItem('nutriplan_log', JSON.stringify(log));
}

function logMeal(recipe, servings = 1){
  const n = getNutrition(recipe);
  const log = loadLog();
  const key = todayKey();
  if(!log[key]) log[key] = [];
  log[key].push({
    id: Date.now(),
    name: recipe.name,
    img: recipe.img,
    calories: n.calories * servings,
    protein: n.protein * servings,
    carbs: n.carbs * servings,
    fat: n.fat * servings,
    servings: servings,
    time: new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})
  });
  saveLog(log);
  renderFoodLog();
}

function deleteLoggedItem(id){
  const log = loadLog();
  const key = todayKey();
  if(log[key]){
    log[key] = log[key].filter(item => item.id !== id);
    saveLog(log);
    renderFoodLog();
  }
}

function clearAllToday(){
  const log = loadLog();
  delete log[todayKey()];
  saveLog(log);
  renderFoodLog();
}

function renderFoodLog(){
  const log = loadLog();
  const key = todayKey();
  const items = log[key] || [];

  document.getElementById('logBannerDate').textContent =
    new Date().toLocaleDateString('en-US',{weekday:'long', month:'short', day:'numeric'});

  const totals = items.reduce((acc,i)=>{
    acc.calories += i.calories; acc.protein += i.protein;
    acc.carbs += i.carbs; acc.fat += i.fat;
    return acc;
  }, {calories:0, protein:0, carbs:0, fat:0});

  ['calories','protein','carbs','fat'].forEach(key2=>{
    const pct = Math.min(100, Math.round((totals[key2]/GOALS[key2])*100));
    document.getElementById('pct'+cap(key2)).textContent = pct+'%';
    document.getElementById('bar'+cap(key2)).style.width = pct+'%';
    document.getElementById('val'+cap(key2)).textContent =
      key2==='calories' ? `${totals[key2]} kcal` : `${totals[key2]} g`;
    document.getElementById('goal'+cap(key2)).textContent =
      key2==='calories' ? `/ ${GOALS[key2]} kcal` : `/ ${GOALS[key2]} g`;
  });

  const list = document.getElementById('loggedItemsList');
  const logEmptyState = document.getElementById('logEmptyState');
  document.getElementById('loggedItemsCount').textContent = `Logged Items (${items.length})`;

  if(items.length === 0){
    list.innerHTML = '';
    logEmptyState.classList.remove('d-none');
  } else {
    logEmptyState.classList.add('d-none');
    list.innerHTML = items.slice().reverse().map(i=>`
      <div class="logged-item">
        <img src="${i.img}" alt="${i.name}" onerror="this.onerror=function(){this.src='';this.style.background='#eef0f2';}; this.src='${fallbackImageUrl(i.name)}';">
        <div class="logged-item-info">
          <div class="logged-item-name">${i.name}</div>
          <div class="logged-item-meta">${i.servings} serving • <a href="#">Recipe</a></div>
          <div class="logged-item-time">${i.time}</div>
        </div>
        <div class="logged-item-right">
          <div class="logged-item-macros">
            <span class="macro-chip macro-p">${i.protein}g P</span>
            <span class="macro-chip macro-c">${i.carbs}g C</span>
            <span class="macro-chip macro-f">${i.fat}g F</span>
          </div>
          <div class="logged-item-cal">${i.calories}<small>kcal</small></div>
          <i class="bi bi-trash3 logged-item-del" data-id="${i.id}"></i>
        </div>
      </div>
    `).join('');
        document.querySelectorAll('.logged-item-del').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = Number(btn.dataset.id);
        const item = items.find(i => i.id === id);
        showConfirmModal(
          "Delete This Item?",
          `This will remove "${item ? item.name : 'this item'}" from today's log.`,
          ()=>{
            deleteLoggedItem(id);
            showClearedModal("Deleted!", "The item has been removed from your log.");
          }
        );
      });
    });
  }

  renderWeeklyOverview(log);
}

function renderWeeklyOverview(log){
  const wgrid = document.getElementById('weeklyGrid');
  const today = new Date();
  const days = [];
  for(let i=6;i>=0;i--){
    const d = new Date(today);
    d.setDate(today.getDate()-i);
    days.push(d);
  }
  wgrid.innerHTML = days.map(d=>{
    const key = dateKey(d);
    const items = log[key] || [];
    const cal = items.reduce((s,i)=>s+i.calories,0);
    const isToday = key === todayKey();
    return `
      <div class="weekly-day ${isToday?'today':''} ${cal>0?'has-data':''}">
        <div class="weekly-day-name">${d.toLocaleDateString('en-US',{weekday:'short'})}</div>
        <div class="weekly-day-num">${d.getDate()}</div>
        <div class="weekly-day-cal">${cal}<small>kcal</small></div>
        ${cal>0?`<div class="weekly-day-items">${items.length} items</div>`:''}
      </div>
    `;
  }).join('');

  let totalCal = 0, totalItems = 0, daysOnGoal = 0, daysWithData = 0;
  days.forEach(d=>{
    const key = dateKey(d);
    const items = log[key] || [];
    const cal = items.reduce((s,i)=>s+i.calories,0);
    totalCal += cal;
    totalItems += items.length;
    if(items.length > 0){
      daysWithData++;
      if(cal >= GOALS.calories*0.9 && cal <= GOALS.calories*1.1) daysOnGoal++;
    }
  });
  const avg = daysWithData > 0 ? Math.round(totalCal / daysWithData) : 0;

  document.getElementById('weeklyAvg').textContent = `${avg} kcal`;
  document.getElementById('weeklyTotalItems').textContent = `${totalItems} items`;
  document.getElementById('daysOnGoal').textContent = `${daysOnGoal} / 7`;
}

document.getElementById('clearAllBtn').addEventListener('click', ()=>{
  showConfirmModal(
    "Clear Today's Log?",
    "This will remove all logged food items for today.",
    ()=>{
      clearAllToday();
      showClearedModal("Cleared!", "Your food log has been cleared.");
    }
  );
});
document.getElementById('browseRecipesBtn').addEventListener('click', ()=> showPage('meals'));
document.getElementById('scanProductBtn').addEventListener('click', ()=> showPage('scanner'));




/* ---------- Reusable confirm + feedback modals ---------- */

function showConfirmModal(title, message, onConfirm){
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMsg').textContent = message;
  document.getElementById('confirmModal').classList.add('show');

  const yesBtn = document.getElementById('confirmYesBtn');
  const noBtn = document.getElementById('confirmNoBtn');

  function cleanup(){
    document.getElementById('confirmModal').classList.remove('show');
    yesBtn.removeEventListener('click', onYes);
    noBtn.removeEventListener('click', onNo);
  }
  function onYes(){ cleanup(); onConfirm(); }
  function onNo(){ cleanup(); }

  yesBtn.addEventListener('click', onYes);
  noBtn.addEventListener('click', onNo);
}

function showClearedModal(title, message){
  document.getElementById('clearedTitle').textContent = title;
  document.getElementById('clearedMsg').textContent = message;
  document.getElementById('clearedModal').classList.add('show');
  setTimeout(()=>{
    document.getElementById('clearedModal').classList.remove('show');
  }, 1800);
}

/* ====================================================================
   5. PAGE: PRODUCT SCANNER  (Open Food Facts)
   ==================================================================== */

const productSearchInput = document.getElementById("productSearchInput");
const productSearchBtn = document.getElementById("productSearchBtn");
const barcodeInput = document.getElementById("barcodeInput");
const barcodeSearchBtn = document.getElementById("barcodeSearchBtn");
const productResults = document.getElementById("productResults");
const productEmptyState = document.getElementById("productEmptyState");
const productLoading = document.getElementById("productLoading");
const scoreFilters = document.querySelectorAll(".score-filter");
const productCategories = document.querySelectorAll(".product-category");

let scannerProducts = [];
let currentScore = "all";

function showProductLoading(){
  productLoading.classList.remove("d-none");
  productEmptyState.classList.add("d-none");
  productResults.innerHTML = "";
}
function hideProductLoading(){
  productLoading.classList.add("d-none");
}
function showScannerMessage(message){
  hideProductLoading();
  productResults.innerHTML = "";
  productEmptyState.classList.remove("d-none");
  productEmptyState.innerHTML = `
    <div class="product-empty-icon"><i class="bi bi-exclamation-circle"></i></div>
    <h3>${escapeHTML(message)}</h3>
    <p>Try searching again</p>
  `;
}

function getNutriScore(product){
  let score = product.nutriscore_grade || product.nutrition_grades || "";
  score = score.toString().toLowerCase().trim();
  return ["a","b","c","d","e"].includes(score) ? score : "";
}

function formatNumber(value){
  if(value === undefined || value === null || value === "" || isNaN(value)) return "0";
  return Number(value).toFixed(1);
}

async function searchProductByName(name){
  if(!name.trim()){ showScannerMessage("Please enter a product name"); return; }
  showProductLoading();
  try{
    const url = "https://world.openfoodfacts.org/cgi/search.pl"
      + "?search_terms=" + encodeURIComponent(name)
      + "&search_simple=1&action=process&json=1&page_size=20";
    const response = await fetch(url);
    if(!response.ok) throw new Error("Network error");
    const data = await response.json();
    scannerProducts = data.products || [];
    hideProductLoading();
    displayProducts(scannerProducts);
  }catch(error){
    hideProductLoading();
    showScannerMessage("Unable to load products. Check your internet connection.");
  }
}

async function searchProductByBarcode(barcode){
  if(!barcode.trim()){ showScannerMessage("Please enter a barcode"); return; }
  showProductLoading();
  try{
    const url = "https://world.openfoodfacts.org/api/v2/product/" + encodeURIComponent(barcode);
    const response = await fetch(url);
    if(!response.ok) throw new Error("Network error");
    const data = await response.json();
    hideProductLoading();
    if(data.status !== 1 || !data.product){
      scannerProducts = [];
      productResults.innerHTML = "";
      productEmptyState.classList.remove("d-none");
      productEmptyState.innerHTML = `
        <div class="product-empty-icon"><i class="bi bi-search"></i></div>
        <h3>Product not found</h3>
        <p>No product was found with this barcode</p>
      `;
      return;
    }
    scannerProducts = [data.product];
    displayProducts(scannerProducts);
  }catch(error){
    hideProductLoading();
    showScannerMessage("Unable to find this product.");
  }
}

async function searchProductByCategory(category){
  showProductLoading();
  try{
    const url = "https://world.openfoodfacts.org/cgi/search.pl"
      + "?categories_tags_en=" + encodeURIComponent(category)
      + "&action=process&json=1&page_size=20";
    const response = await fetch(url);
    if(!response.ok) throw new Error("Network error");
    const data = await response.json();
    scannerProducts = data.products || [];
    hideProductLoading();
    displayProducts(scannerProducts);
  }catch(error){
    hideProductLoading();
    showScannerMessage("Unable to load this category.");
  }
}

function displayProducts(products){
  let filtered = products;
  if(currentScore !== "all"){
    filtered = products.filter(p => getNutriScore(p) === currentScore);
  }

  productResults.innerHTML = "";

  if(!filtered.length){
    productEmptyState.classList.remove("d-none");
    productEmptyState.innerHTML = `
      <div class="product-empty-icon"><i class="bi bi-box-seam"></i></div>
      <h3>No products found</h3>
      <p>Try another product or change the filter</p>
    `;
    return;
  }

  productEmptyState.classList.add("d-none");
  filtered.forEach(product => productResults.appendChild(createProductCard(product)));
}

function createProductCard(product){
  const card = document.createElement("div");
  card.className = "product-card";

  const image = product.image_front_small_url || product.image_front_url || product.image_url
    || "https://via.placeholder.com/110?text=No+Image";
  const name = product.product_name || "Unknown Product";
  const brand = product.brands || "Unknown Brand";
  const score = getNutriScore(product);
  const nutriments = product.nutriments || {};
  const calories = nutriments["energy-kcal_100g"];
  const protein = nutriments.proteins_100g;
  const carbs = nutriments.carbohydrates_100g;
  const fat = nutriments.fat_100g;

  card.innerHTML = `
    <img class="product-card-image" src="${image}" alt="${escapeHTML(name)}"
         onerror="this.src='https://via.placeholder.com/110?text=No+Image'">
    <div class="product-card-info">
      <h3 class="product-card-name">${escapeHTML(name)}</h3>
      <div class="product-card-brand">${escapeHTML(brand)}</div>
      <div style="margin-bottom:10px;">
        ${score
          ? `<span class="product-nutri-score ${score}">${score.toUpperCase()}</span>`
          : `<span style="font-size:12px;color:var(--muted);">No Nutri-Score</span>`}
      </div>
      <div class="product-macros">
        <span>Calories: <b>${formatNumber(calories)} kcal</b></span>
        <span>Protein: <b>${formatNumber(protein)} g</b></span>
        <span>Carbs: <b>${formatNumber(carbs)} g</b></span>
        <span>Fat: <b>${formatNumber(fat)} g</b></span>
      </div>
    </div>
  `;

  card.addEventListener("click", ()=> showProductDetails(product));
  return card;
}

let currentProduct = null;

function novaInfo(novaGroup){
  const map = {
    1: {label:"Unprocessed", cls:"nova-1"},
    2: {label:"Processed culinary", cls:"nova-2"},
    3: {label:"Processed", cls:"nova-3"},
    4: {label:"Ultra-processed", cls:"nova-4"}
  };
  return map[novaGroup] || {label:"Unknown", cls:""};
}

function nutriScoreSub(score){
  const map = {a:"Excellent", b:"Good", c:"Average", d:"Poor", e:"Bad"};
  return map[score] || "Unknown";
}

function showProductDetails(product){
  currentProduct = product;

  const name = product.product_name || "Unknown Product";
  const brand = product.brands || "Unknown Brand";
  const image = product.image_front_url || product.image_url || product.image_front_small_url || "";
  const score = getNutriScore(product);
  const nova = product.nova_group;
  const n = product.nutriments || {};

  document.getElementById('pdImage').src = image;
  document.getElementById('pdImage').onerror = function(){ this.style.background = '#f5f7f9'; this.src=''; };
  document.getElementById('pdBrand').textContent = brand;
  document.getElementById('pdName').textContent = name;

  const nutriBadge = document.getElementById('pdNutriBadge');
  nutriBadge.className = 'pd-score-badge' + (score ? ` score-${score}` : '');
  document.getElementById('pdNutriLetter').textContent = score ? score.toUpperCase() : '?';
  document.getElementById('pdNutriSub').textContent = nutriScoreSub(score);

  const novaBadge = document.getElementById('pdNovaBadge');
  const ni = novaInfo(nova);
  novaBadge.className = 'pd-nova-badge' + (ni.cls ? ` ${ni.cls}` : '');
  document.getElementById('pdNovaNum').textContent = nova || '?';
  document.getElementById('pdNovaSub').textContent = ni.label;

  const calories = n["energy-kcal_100g"] || 0;
  const protein = n.proteins_100g || 0;
  const carbs = n.carbohydrates_100g || 0;
  const fat = n.fat_100g || 0;
  const sugar = n.sugars_100g || 0;
  const satFat = n["saturated-fat_100g"] || 0;
  const fiber = n.fiber_100g || 0;
  const salt = n.salt_100g || 0;

  document.getElementById('pdCalories').textContent = formatNumber(calories);
  document.getElementById('pdProtein').textContent = formatNumber(protein) + 'g';
  document.getElementById('pdCarbs').textContent = formatNumber(carbs) + 'g';
  document.getElementById('pdFat').textContent = formatNumber(fat) + 'g';
  document.getElementById('pdSugar').textContent = formatNumber(sugar) + 'g';
  document.getElementById('pdSatFat').textContent = formatNumber(satFat) + 'g';
  document.getElementById('pdFiber').textContent = formatNumber(fiber) + 'g';
  document.getElementById('pdSalt').textContent = formatNumber(salt) + 'g';

  document.getElementById('pdProteinBar').style.width = Math.min(100, protein*2) + '%';
  document.getElementById('pdCarbsBar').style.width = Math.min(100, carbs) + '%';
  document.getElementById('pdFatBar').style.width = Math.min(100, fat*2) + '%';
  document.getElementById('pdSugarBar').style.width = Math.min(100, sugar) + '%';

  document.getElementById('productDetailModal').classList.add('show');
}

function closeProductDetailModal(){
  document.getElementById('productDetailModal').classList.remove('show');
}

document.getElementById('pdCloseX').addEventListener('click', closeProductDetailModal);
document.getElementById('pdCloseBtn').addEventListener('click', closeProductDetailModal);
document.getElementById('productDetailModal').addEventListener('click', e=>{
  if(e.target.id === 'productDetailModal') closeProductDetailModal();
});

document.getElementById('pdLogBtn').addEventListener('click', ()=>{
  if(!currentProduct) return;
  const n = currentProduct.nutriments || {};
  const name = currentProduct.product_name || "Unknown Product";
  const image = currentProduct.image_front_url || currentProduct.image_url || currentProduct.image_front_small_url || "";
  const calories = Math.round(n["energy-kcal_100g"] || 0);
  const protein = Math.round(n.proteins_100g || 0);
  const carbs = Math.round(n.carbohydrates_100g || 0);
  const fat = Math.round(n.fat_100g || 0);

  const log = loadLog();
  const key = todayKey();
  if(!log[key]) log[key] = [];
  log[key].push({
    id: Date.now(),
    name: name,
    img: image,
    calories: calories,
    protein: protein,
    carbs: carbs,
    fat: fat,
    servings: 1,
    time: new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})
  });
  saveLog(log);

  closeProductDetailModal();
  showSuccessModal(name, 1, calories);
});

if(productSearchBtn){
  productSearchBtn.addEventListener("click", ()=> searchProductByName(productSearchInput.value));
}
if(productSearchInput){
  productSearchInput.addEventListener("keydown", e=>{
    if(e.key === "Enter") searchProductByName(productSearchInput.value);
  });
}
if(barcodeSearchBtn){
  barcodeSearchBtn.addEventListener("click", ()=> searchProductByBarcode(barcodeInput.value));
}
if(barcodeInput){
  barcodeInput.addEventListener("keydown", e=>{
    if(e.key === "Enter") searchProductByBarcode(barcodeInput.value);
  });
}
scoreFilters.forEach(button=>{
  button.addEventListener("click", ()=>{
    scoreFilters.forEach(btn=>btn.classList.remove("active"));
    button.classList.add("active");
    currentScore = button.dataset.score || "all";
    displayProducts(scannerProducts);
  });
});
productCategories.forEach(button=>{
  button.addEventListener("click", ()=>{
    const category = button.dataset.category;
    if(category) searchProductByCategory(category);
  });
});


/* ====================================================================
   6. PAGE SWITCHING / NAVIGATION
   ==================================================================== */

function showPage(page){
  document.getElementById('listView').classList.add('d-none');
  document.getElementById('detailView').classList.add('d-none');
  document.getElementById('logView').classList.add('d-none');
  document.getElementById('scannerView').classList.add('d-none');

  document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));

  if(page === 'meals'){
    document.getElementById('listView').classList.remove('d-none');
    document.querySelector('.nav-item[data-page="meals"]').classList.add('active');
  } else if(page === 'log'){
    document.getElementById('logView').classList.remove('d-none');
    document.querySelector('.nav-item[data-page="log"]').classList.add('active');
    renderFoodLog();
  } else if(page === 'scanner'){
    document.getElementById('scannerView').classList.remove('d-none');
    document.querySelector('.nav-item[data-page="scanner"]').classList.add('active');
  } else if(page === 'detail'){
    document.getElementById('detailView').classList.remove('d-none');
  }
  window.scrollTo(0,0);
}

document.querySelectorAll('.nav-item').forEach(item=>{
  item.addEventListener('click', ()=> showPage(item.dataset.page));
});

document.getElementById('mobileToggle').addEventListener('click', ()=>{
  document.getElementById('sidebar').classList.toggle('open');
});


/* ====================================================================
   7. LOADING SCREEN + INITIAL RENDER
   ==================================================================== */

render();

window.addEventListener('load', ()=>{
  const loadingScreen = document.getElementById('loadingScreen');
  setTimeout(()=>{
    loadingScreen.classList.add('hide');
  }, 100);
});