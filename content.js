(function () {
  if (document.getElementById("nav-checker-btn")) return;

  let autoFilled = false;

  const btn = document.createElement("button");
  btn.id = "nav-checker-btn";
  btn.className = "button-1";
  btn.innerHTML = `<span class="button-1-shadow"></span><span class="button-1-edge"></span><span class="button-1-front text">محاسبه گر</span>`;
  document.body.appendChild(btn);

  const pop = document.createElement("div");
  pop.id = "nav-checker-popover";
  pop.innerHTML = `
    <label>NAV (قیمت آماری)</label>
    <input type="number" id="nav_price">

    <label>قیمت صدور (خرید)</label>
    <input type="number" id="buy_price">

    <label>قیمت ابطال (فروش)</label>
    <input type="number" id="sell_price">

    <label>تلورانس (%)</label>
    <input type="number" id="tolerance" value="1" step="0.1">

    <button id="calc_nav" class="button-28">محاسبه</button>
    <div id="nav_result"></div>
  `;
  document.body.appendChild(pop);
  if (!autoFilled) {
    autoFilled = true;
    setTimeout(autoFillFromPage, 800);
  }
  btn.addEventListener("click", () => {
    pop.classList.toggle("show");
  });

  function autoFillFromPage() {
    const rows = document.querySelectorAll("#MainContent > div > div:nth-of-type(2) tr");
    if (!rows.length) return;

    let nav, buy, sell;

    rows.forEach(tr => {
      const tds = tr.querySelectorAll("td");
      if (tds.length < 2) return;

      const label = tds[0].innerText.trim();
      const value = parseFloat(tds[1].innerText.replace(/,/g, "").trim());

      if (label.includes("قیمت آماری")) nav = value;
      if (label.includes("قیمت صدور")) buy = value;
      if (label.includes("قیمت ابطال")) sell = value;
    });

    if (nav) document.getElementById("nav_price").value = nav;
    if (buy) document.getElementById("buy_price").value = buy;
    if (sell) document.getElementById("sell_price").value = sell;

    document.getElementById("calc_nav").click();
  }

  document.getElementById("calc_nav").addEventListener("click", () => {
    const nav = parseFloat(document.getElementById("nav_price").value);
    const buy = parseFloat(document.getElementById("buy_price").value);
    const sell = parseFloat(document.getElementById("sell_price").value);
    const tol = parseFloat(document.getElementById("tolerance").value);

    if (!nav || !buy || !sell) {
      showResult("همه فیلدها را پر کنید", "warn");
      return;
    }

    const buyDiff = ((buy - nav) / nav) * 100;
    const sellDiff = ((nav - sell) / nav) * 100;

    if (buyDiff <= tol) {
      showResult(`✅ مناسب خرید (${buyDiff.toFixed(2)}٪)`, "buy");
    } else if (sellDiff >= tol) {
      showResult(`🔴 مناسب فروش (${sellDiff.toFixed(2)}٪)`, "sell");
    } else {
      showResult("⚖️ خنثی", "neutral");
    }
  });

  function showResult(text, type) {
    const el = document.getElementById("nav_result");
    el.className = type;
    el.innerText = text;

    // Update button color based on result
    const btnEdge = btn.querySelector(".button-1-edge");
    const btnFront = btn.querySelector(".button-1-front");

    if (btnEdge && btnFront) {
      // Remove all color classes
      btnEdge.classList.remove("buy", "sell", "neutral");
      btnFront.classList.remove("buy", "sell", "neutral");

      // Add the appropriate color class
      if (type !== "warn") {
        btnEdge.classList.add(type);
        btnFront.classList.add(type);
      }
    }
  }
})();