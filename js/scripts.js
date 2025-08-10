// Load saved data or create default, reset market and ret on load
let savedData = JSON.parse(localStorage.getItem("productData")) || {};
let data = {};
products.forEach((p, i) => {
  data[i] = {
    market: "",
    ret: "",
    mullo: savedData[i]?.mullo || ((p.price * 12) / 13).toFixed(2),
  };
});

const tbody = document.querySelector("#productTable tbody");

// Group products by category
const grouped = products.reduce((acc, product, i) => {
  if (!acc[product.category]) acc[product.category] = [];
  acc[product.category].push({ ...product, index: i });
  return acc;
}, {});

function renderTable() {
  tbody.innerHTML = "";
  Object.keys(grouped).forEach(category => {
    // Category header row, spans all columns (7)
    const catRow = document.createElement("tr");
    catRow.className = "category-row";
    const tdCat = document.createElement("td");
    tdCat.colSpan = 7;
    tdCat.textContent = category;
    catRow.appendChild(tdCat);
    tbody.appendChild(catRow);

    // Clicking category toggles product rows visibility
    catRow.addEventListener("click", () => {
      const isExpanded = catRow.classList.toggle("expanded");
      grouped[category].forEach(item => {
        const prodRow = document.getElementById(`prod-${item.index}`);
        if (prodRow) prodRow.classList.toggle("hidden-row", !isExpanded);
      });
    });

    // Render products under this category, initially hidden
    grouped[category].forEach(item => {
      const tr = document.createElement("tr");
      tr.id = `prod-${item.index}`;
      tr.classList.add("hidden-row");

      // Category column (first)
      let td = document.createElement("td");
      td.textContent = item.category;
      td.setAttribute("data-label", "বিভাগ");
      tr.appendChild(td);

      // Product name
      td = document.createElement("td");
      td.textContent = item.name;
      td.setAttribute("data-label", "পণ্যের নাম");
      tr.appendChild(td);

      // Price (readonly)
      td = document.createElement("td");
      td.textContent = item.price.toFixed(2);
      td.setAttribute("data-label", "ট্রেড মূল্য (৳)");
      tr.appendChild(td);

      // Mullo (readonly)
      td = document.createElement("td");
      td.textContent = data[item.index].mullo;
      td.setAttribute("data-label", "মূল্য (৳)");
      tr.appendChild(td);

      // Market (input)
      td = document.createElement("td");
      td.setAttribute("data-label", "মার্কেটে");
      const inputMarket = document.createElement("input");
      inputMarket.type = "number";
      inputMarket.min = 0;
      inputMarket.value = data[item.index].market;
      inputMarket.placeholder = "";
      inputMarket.addEventListener("input", () => {
        const val = inputMarket.value;
        data[item.index].market = val === "" || Number(val) < 0 ? "" : Number(val);
        updateRow(item.index);
        saveData();
        updateTotals();
      });
      td.appendChild(inputMarket);
      tr.appendChild(td);

      // Ret (input)
      td = document.createElement("td");
      td.setAttribute("data-label", "ফেরত");
      const inputRet = document.createElement("input");
      inputRet.type = "number";
      inputRet.min = 0;
      inputRet.value = data[item.index].ret;
      inputRet.placeholder = "";
      inputRet.addEventListener("input", () => {
        const val = inputRet.value;
        data[item.index].ret = val === "" || Number(val) < 0 ? "" : Number(val);
        updateRow(item.index);
        saveData();
        updateTotals();
      });
      td.appendChild(inputRet);
      tr.appendChild(td);

      // Sold (readonly)
      td = document.createElement("td");
      td.setAttribute("data-label", "বিক্রি");
      const inputSold = document.createElement("input");
      inputSold.type = "number";
      inputSold.readOnly = true;
      const marketVal = Number(data[item.index].market);
      const retVal = Number(data[item.index].ret);
      let soldVal = 0;
      if (!isNaN(marketVal) && !isNaN(retVal)) soldVal = Math.max(0, marketVal - retVal);
      inputSold.value = soldVal;
      td.appendChild(inputSold);
      tr.appendChild(td);

      // Total price (readonly)
      td = document.createElement("td");
      td.setAttribute("data-label", "মোট দাম (৳)");
      const mulloNum = parseFloat(data[item.index].mullo) || 0;
      const totalPrice = Math.ceil(mulloNum * soldVal);
      td.textContent = totalPrice;
      tr.appendChild(td);

      tbody.appendChild(tr);
    });
  });
}

function updateRow(i) {
  const tr = document.getElementById(`prod-${i}`);
  const marketVal = Number(data[i].market);
  const retVal = Number(data[i].ret);
  let soldVal = 0;
  if (!isNaN(marketVal) && !isNaN(retVal)) {
    soldVal = Math.max(0, marketVal - retVal);
  }
  // Sold update (index 6)
  const inputSold = tr.children[6].querySelector("input");
  inputSold.value = soldVal;

  // Total price update (index 7)
  const mulloNum = parseFloat(data[i].mullo) || 0;
  const totalPrice = Math.ceil(mulloNum * soldVal);
  tr.children[7].textContent = totalPrice;
}

function updateTotals() {
  let totalSold = 0, totalPrice = 0;
  products.forEach((p, i) => {
    const marketVal = Number(data[i]?.market);
    const retVal = Number(data[i]?.ret);
    let sold = 0;
    if (!isNaN(marketVal) && !isNaN(retVal)) {
      sold = Math.max(0, marketVal - retVal);
    }
    totalSold += sold;
    const mullo = parseFloat(data[i]?.mullo) || 0;
    totalPrice += mullo * sold;
  });
  document.getElementById("totalSold").textContent = totalSold;
  document.getElementById("totalPrice").textContent = Math.ceil(totalPrice);
}

function saveData() {
  localStorage.setItem("productData", JSON.stringify(data));
}

function downloadCSV() {
  let csv = "বিভাগ,পণ্যের নাম,ট্রেড মূল্য (৳),মূল্য (৳),মার্কেটে,ফেরত,বিক্রি,মোট দাম (৳)\n";
  products.forEach((p, i) => {
    const cat = p.category;
    const name = p.name;
    const tradePrice = p.price.toFixed(2);
    const mullo = data[i]?.mullo || ((p.price * 12) / 13).toFixed(2);
    const market = data[i]?.market || "";
    const ret = data[i]?.ret || "";
    const marketNum = Number(market);
    const retNum = Number(ret);
    let sold = 0;
    if (!isNaN(marketNum) && !isNaN(retNum)) {
      sold = Math.max(0, marketNum - retNum);
    }
    const total = Math.ceil(parseFloat(mullo) * sold);
    csv += `"${cat}","${name}",${tradePrice},${mullo},${market},${ret},${sold},${total}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "product_sales.csv";
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("downloadBtn").addEventListener("click", downloadCSV);

// Initial render and totals update
renderTable();
updateTotals();
