// লোকাল স্টোরেজ থেকে ডেটা লোড (নাহলে খালি অবজেক্ট)
let data = JSON.parse(localStorage.getItem("productData")) || {};

const tbody = document.querySelector("#productTable tbody");

function renderTable() {
  tbody.innerHTML = "";
  products.forEach(([name, price], i) => {
    if (!data[i]) data[i] = { market:"", ret:"" };
    const tr = document.createElement("tr");

    let td = document.createElement("td");
    td.textContent = name;
    td.setAttribute("data-label","পণ্যের নাম");
    tr.appendChild(td);

    td = document.createElement("td");
    td.textContent = price.toFixed(2);
    td.setAttribute("data-label","দাম (৳)");
    tr.appendChild(td);

    td = document.createElement("td");
    td.setAttribute("data-label","মার্কেটে");
    const inputMarket = document.createElement("input");
    inputMarket.type = "number";
    inputMarket.min = 0;
    inputMarket.value = data[i].market;
    inputMarket.addEventListener("input", () => {
      data[i].market = inputMarket.value;
      updateRow(i);
      saveData();
      updateTotals();
    });
    td.appendChild(inputMarket);
    tr.appendChild(td);

    td = document.createElement("td");
    td.setAttribute("data-label","ফেরত");
    const inputRet = document.createElement("input");
    inputRet.type = "number";
    inputRet.min = 0;
    inputRet.value = data[i].ret;
    inputRet.addEventListener("input", () => {
      data[i].ret = inputRet.value;
      updateRow(i);
      saveData();
      updateTotals();
    });
    td.appendChild(inputRet);
    tr.appendChild(td);

    td = document.createElement("td");
    td.setAttribute("data-label","বিক্রি");
    const inputSold = document.createElement("input");
    inputSold.type = "number";
    inputSold.readOnly = true;
    inputSold.value = Math.max(0, (Number(data[i].market) || 0) - (Number(data[i].ret) || 0));
    td.appendChild(inputSold);
    tr.appendChild(td);

    td = document.createElement("td");
    td.setAttribute("data-label","মোট দাম (৳)");
    td.textContent = (((Number(data[i].market) || 0) - (Number(data[i].ret) || 0)) * price).toFixed(2);
    tr.appendChild(td);

    tbody.appendChild(tr);
  });
}

function updateRow(i) {
  const tr = tbody.children[i];
  const price = products[i][1];
  const market = Number(data[i].market) || 0;
  const ret = Number(data[i].ret) || 0;
  const sold = Math.max(0, market - ret);

  const inputSold = tr.children[4].querySelector("input");
  inputSold.value = sold;

  tr.children[5].textContent = (price * sold).toFixed(2);
}

function updateTotals() {
  let totalSold = 0, totalPrice = 0;
  products.forEach((p, i) => {
    const market = Number(data[i]?.market) || 0;
    const ret = Number(data[i]?.ret) || 0;
    const sold = Math.max(0, market - ret);
    totalSold += sold;
    totalPrice += sold * p[1];
  });
  document.getElementById("totalSold").textContent = totalSold;
  document.getElementById("totalPrice").textContent = totalPrice.toFixed(2);
}

function saveData() {
  localStorage.setItem("productData", JSON.stringify(data));
}

function downloadCSV() {
  let csv = "পণ্যের নাম,দাম (৳),মার্কেটে,ফেরত,বিক্রি,মোট দাম (৳)\n";
  products.forEach((p, i) => {
    const name = p[0];
    const price = p[1].toFixed(2);
    const market = data[i]?.market || "";
    const ret = data[i]?.ret || "";
    const sold = Math.max(0, (Number(market) || 0) - (Number(ret) || 0));
    const total = (sold * p[1]).toFixed(2);
    csv += `"${name}",${price},${market},${ret},${sold},${total}\n`;
  });

  const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "product_sales.csv";
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("downloadBtn").addEventListener("click", downloadCSV);

renderTable();
updateTotals();
