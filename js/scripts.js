// products.js should define "products" array before this script

// Load saved data or create default, but reset market and ret to empty string on page load
let savedData = JSON.parse(localStorage.getItem("productData")) || {};
let data = {};
products.forEach(([, tradePrice], i) => {
  data[i] = {
    market: "",  // ফাঁকা শুরুতে
    ret: "",     // ফাঁকা শুরুতে
    mullo: savedData[i]?.mullo || ((tradePrice * 12) / 13).toFixed(2),
  };
});

const tbody = document.querySelector("#productTable tbody");

function renderTable() {
  tbody.innerHTML = "";
  products.forEach(([name, tradePrice], i) => {
    const tr = document.createElement("tr");

    // পণ্যের নাম
    let td = document.createElement("td");
    td.textContent = name;
    td.setAttribute("data-label", "পণ্যের নাম");
    tr.appendChild(td);

    // ট্রেড মূল্য (readonly)
    td = document.createElement("td");
    td.textContent = tradePrice.toFixed(2);
    td.setAttribute("data-label", "ট্রেড মূল্য (৳)");
    tr.appendChild(td);

    // মূল্য (editable)
    td = document.createElement("td");
    td.setAttribute("data-label", "মূল্য (৳)");
    const inputMullo = document.createElement("input");
    inputMullo.type = "number";
    inputMullo.min = 0;
    inputMullo.step = "0.01";
    inputMullo.value = data[i].mullo;
    inputMullo.addEventListener("input", () => {
      data[i].mullo = inputMullo.value;
      updateRow(i);
      saveData();
      updateTotals();
    });
    td.appendChild(inputMullo);
    tr.appendChild(td);

    // মার্কেটে ইনপুট (empty string by default)
    td = document.createElement("td");
    td.setAttribute("data-label", "মার্কেটে");
    const inputMarket = document.createElement("input");
    inputMarket.type = "number";
    inputMarket.min = 0;
    inputMarket.value = data[i].market;
    inputMarket.placeholder = "";  // ফাঁকা প্লেসহোল্ডার
    inputMarket.addEventListener("input", () => {
      // যদি ফাঁকা বা নেতিবাচক, তাহলে "" রাখো
      const val = inputMarket.value;
      if(val === "" || Number(val) < 0) {
        data[i].market = "";
      } else {
        data[i].market = Number(val);
      }
      updateRow(i);
      saveData();
      updateTotals();
    });
    td.appendChild(inputMarket);
    tr.appendChild(td);

    // ফেরত ইনপুট (empty string by default)
    td = document.createElement("td");
    td.setAttribute("data-label", "ফেরত");
    const inputRet = document.createElement("input");
    inputRet.type = "number";
    inputRet.min = 0;
    inputRet.value = data[i].ret;
    inputRet.placeholder = "";
    inputRet.addEventListener("input", () => {
      const val = inputRet.value;
      if(val === "" || Number(val) < 0) {
        data[i].ret = "";
      } else {
        data[i].ret = Number(val);
      }
      updateRow(i);
      saveData();
      updateTotals();
    });
    td.appendChild(inputRet);
    tr.appendChild(td);

    // বিক্রি (readonly)
    td = document.createElement("td");
    td.setAttribute("data-label", "বিক্রি");
    const inputSold = document.createElement("input");
    inputSold.type = "number";
    inputSold.readOnly = true;

    // sold হিসাব করতে, মার্কেটে ও ফেরত দুইটাই number হলে করবে, নাহলে 0
    const marketVal = Number(data[i].market);
    const retVal = Number(data[i].ret);
    let soldVal = 0;
    if (!isNaN(marketVal) && !isNaN(retVal)) {
      soldVal = Math.max(0, marketVal - retVal);
    }
    inputSold.value = soldVal;
    td.appendChild(inputSold);
    tr.appendChild(td);

    // মোট দাম (readonly), Math.ceil করে দেখাবে
    td = document.createElement("td");
    td.setAttribute("data-label", "মোট দাম (৳)");
    const mulloNum = parseFloat(data[i].mullo) || 0;
    const totalPrice = Math.ceil(mulloNum * soldVal);
    td.textContent = totalPrice;
    tr.appendChild(td);

    tbody.appendChild(tr);
  });
}

function updateRow(i) {
  const tr = tbody.children[i];

  const marketVal = Number(data[i].market);
  const retVal = Number(data[i].ret);
  let soldVal = 0;
  if (!isNaN(marketVal) && !isNaN(retVal)) {
    soldVal = Math.max(0, marketVal - retVal);
  }

  // বিক্রি আপডেট (index 5)
  const inputSold = tr.children[5].querySelector("input");
  inputSold.value = soldVal;

  // মোট দাম আপডেট (index 6)
  const mulloNum = parseFloat(data[i].mullo) || 0;
  const totalPrice = Math.ceil(mulloNum * soldVal);
  tr.children[6].textContent = totalPrice;
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
  let csv = "পণ্যের নাম,ট্রেড মূল্য (৳),মূল্য (৳),মার্কেটে,ফেরত,বিক্রি,মোট দাম (৳)\n";
  products.forEach((p, i) => {
    const name = p[0];
    const tradePrice = p[1].toFixed(2);
    const mullo = data[i]?.mullo || ((p[1] * 12) / 13).toFixed(2);
    const market = data[i]?.market || "";
    const ret = data[i]?.ret || "";
    const marketNum = Number(market);
    const retNum = Number(ret);
    let sold = 0;
    if (!isNaN(marketNum) && !isNaN(retNum)) {
      sold = Math.max(0, marketNum - retNum);
    }
    const total = Math.ceil(parseFloat(mullo) * sold);
    csv += `"${name}",${tradePrice},${mullo},${market},${ret},${sold},${total}\n`;
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
