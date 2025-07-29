document.addEventListener("DOMContentLoaded", () => {
  const typeSelect = document.getElementById("type-select");
  const categorySelect = document.getElementById("category-select");
  

  const incomeCategories = ["Salary", "Freelance", "Investment", "Gift", "Interest"];
  const expenseCategories = ["Food", "Transport", "Bills", "Rent", "Shopping", "Entertainment"];

  ;

  typeSelect.addEventListener("change", () => {
    let categories = typeSelect.value === "income" ? incomeCategories : expenseCategories;

    categorySelect.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = "Select Category";
    categorySelect.appendChild(defaultOption);

    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  });

  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  document.getElementById("transaction-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const amount = parseFloat(document.querySelector('input[type="number"]').value);
    const type = typeSelect.value.toLowerCase();
    const category = categorySelect.value;
    const date = document.querySelector('input[type="date"]').value;
    const note = document.querySelector('input[type="text"]').value;

    if (!amount || !type || !category || !date) {
      alert("Please fill all required fields.");
      return;
    }

    transactions.push({ amount, type, category, date, note });

    saveToLocal();
    updateDashboardCards();
    displayTransactions();
    renderCategorySummaryList();
    this.reset();

    // Reset category dropdown to placeholder after form reset
    categorySelect.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = "Select Category";
    categorySelect.appendChild(defaultOption);
  });

  function saveToLocal() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }

  function displayTransactions() {
    const list = document.getElementById("transaction-list");
    if (!list) return;

    list.innerHTML = "";

    transactions.forEach((t, i) => {
      const item = document.createElement("li");
      item.className = "list-group-item d-flex justify-content-between align-items-start";

      item.innerHTML = `
        <div class="ms-2 me-auto">
          <div class="fw-bold">₹${t.amount} – ${t.category}</div>
          <small>${t.date} • ${t.note || "No note"}</small>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction(${i})">❌</button>
        </div>
      `;

      list.appendChild(item);
    });
  }

  window.deleteTransaction = function(index) {
    if (confirm("Are you sure you want to delete this transaction?")) {
      transactions.splice(index, 1);
      saveToLocal();
      displayTransactions();
      updateDashboardCards();
      renderCategorySummaryList();
    }
  };

  function updateDashboardCards() {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === "income") totalIncome += t.amount;
      else if (t.type === "expense") totalExpense += t.amount;
    });

    document.getElementById("total-income").textContent = `₹${totalIncome}`;
    document.getElementById("total-expense").textContent = `₹${totalExpense}`;
    document.getElementById("total-balance").textContent = `₹${totalIncome - totalExpense}`;
  }

  // NEW: Render expense overview as a list with percentage
  function renderCategorySummaryList() {
    const listContainer = document.getElementById("expense-summary-list");
    if (!listContainer) return;

    const categoryTotals = {};
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === "expense") {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        totalExpense += t.amount;
      }
    });

    listContainer.innerHTML = "";

    if (totalExpense === 0) {
      listContainer.innerHTML = '<li class="list-group-item text-muted">No expenses added yet.</li>';
      return;
    }

    Object.entries(categoryTotals).forEach(([category, amount]) => {
      const percent = ((amount / totalExpense) * 100).toFixed(1);

      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";

      li.innerHTML = `
        <span>${category}</span>
        <span>₹${amount.toFixed(2)} (${percent}%)</span>
      `;

      listContainer.appendChild(li);
    });
  }

  
  displayTransactions();
  updateDashboardCards();
  renderCategorySummaryList();
});
