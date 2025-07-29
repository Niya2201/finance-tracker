document.addEventListener("DOMContentLoaded", () => {
  const textSummary = document.getElementById("text-summary");
  const graphSummary = document.getElementById("graph-summary");
  const summaryList = document.getElementById("summaryList");
  const summaryDiv = document.getElementById("summary");
  const ctx = document.getElementById("categoryChart");

  let chartInstance = null;
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
 
  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  // Show totals
  summaryDiv.innerHTML = `
    <div class="row text-center mb-4">
      <div class="col-md-4 mb-3">
        <div class="card-glass p-3">
          <h6 class="text-muted">💼 Income</h6>
          <h4 class="text-success">₹${totalIncome}</h4>
        </div>
      </div>
      <div class="col-md-4 mb-3">
        <div class="card-glass p-3">
          <h6 class="text-muted">💸 Expense</h6>
          <h4 class="text-danger">₹${totalExpense}</h4>
        </div>
      </div>
      <div class="col-md-4 mb-3">
        <div class="card-glass p-3">
          <h6 class="text-muted">📊 Balance</h6>
          <h4 class="text-warning">₹${totalBalance}</h4>
        </div>
      </div>
    </div>
  `;

  // Populate list summary
  summaryList.innerHTML = "";
  transactions.forEach(t => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.textContent = `${t.date} - ₹${t.amount} [${t.type}] - ${t.category}${t.note ? ' (' + t.note + ')' : ''}`;
    summaryList.appendChild(li);
  });

  // Render expense category pie chart
  function renderCategoryChart() {
    if (!ctx) return;

    const categoryTotals = {};
    transactions.forEach(t => {
      if (t.type === "expense") {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = labels.map(() => "#" + Math.floor(Math.random() * 16777215).toString(16));

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors
        }]
      },
      options: {
        plugins: {
          legend: { position: 'bottom', labels: { color: '#000' } },
          title: { display: true, text: 'Expense Breakdown', color: '#ff7b00' }
        }
      }
    });
  }

  // Initially hide graph summary
  graphSummary.classList.add("d-none");

  // Toggle between list and graph views
  toggleBtn.addEventListener("click", () => {
    const showingGraph = !graphSummary.classList.contains("d-none");

    if (showingGraph) {
      graphSummary.classList.add("d-none");
      textSummary.classList.remove("d-none");
      toggleBtn.innerHTML = `<i class="fas fa-chart-pie me-1"></i> Show Graph`;
    } else {
      graphSummary.classList.remove("d-none");
      textSummary.classList.add("d-none");
      toggleBtn.innerHTML = `<i class="fas fa-list me-1"></i> Show List`;
      renderCategoryChart();
    }
  });
});
