class oo {
  name: string;
  values: number[];
}

let all = {
  product: ["a", "b", "a", "b", "b"],
  year1: [1,2,3,4,5],
  year2: [5,6,7,8,9],
  year3: [11,22,33,44,55]
};

let years = ["product", "year1", "year2", "year3"];

let out_all = [];
for(let j = 1; j < years.length; j++) {
  console.log( j + "    " + years[j])
  let out = [];
  for(let i = 0; i < all["product"].length; i++) {
      let left = out.filter((x: oo) => x.name == all["product"][i]);
      if(!left.length) {
          let x: oo = {name: all["product"][i], values: [all[years[j]][i]]}
          out.push(x);
      } else {
          left[0].values.push(all[years[j]][i]);
      }
  }
  out_all[years[j]] = out;
}

console.log(out_all);