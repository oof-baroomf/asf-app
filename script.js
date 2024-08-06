const app = document.getElementById('app');
let currentScreen = 'initialization';
let schoolData = {};

const departments = [
  'Mathematics', 'Science', 'Social Studies', 'English',
  'World Language', 'Arts', 'Business/Technology',
  'Administration', 'Guidance', 'Health Office'
];

function renderScreen() {
  switch (currentScreen) {
    case 'initialization':
      renderInitializationScreen();
      break;
    case 'schoolName':
      renderSchoolNameInput();
      break;
    case 'departmentSelection':
      renderDepartmentSelection();
      break;
    case 'departmentNumbers':
      renderDepartmentNumbers();
      break;
    case 'extraQuestions':
      renderExtraQuestions();
      break;
    case 'results':
      renderResults();
      break;
    case 'statistics':
      renderStatistics();
      break;
    case 'recommendations':
      renderRecommendations();
      break;
    default:
      app.innerHTML = '<div>Unknown screen</div>';
  }
}

function handleNextScreen(nextScreen, data) {
  schoolData = { ...schoolData, ...data };

  if (nextScreen === 'results') {
    const results = calculateResults(schoolData);
    schoolData = { ...schoolData, ...results };
  }

  currentScreen = nextScreen;
  renderScreen();
}

function renderInitializationScreen() {
  document.body.style.backgroundImage = "url('initialization.png')";
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.backgroundSize = "contain";
   app.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: flex-end; height: 70vh;">
      <button onclick="handleNextScreen('schoolName')" style="width: 30%; height: 10%; margin: 0 auto 20px;">Start</button>
    </div>
  `;
}

function renderSchoolNameInput() {
  document.body.style.backgroundImage = "url('name-of-school.png')";
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.backgroundSize = "contain";
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: flex-end; height: 70vh;">
      <form onsubmit="event.preventDefault(); handleNextScreen('departmentSelection', { name: document.getElementById('schoolName').value })">
        <input type="text" id="schoolName" required>
        <button type="submit">Next</button>
      </form>
    </div>
  `;
}

function renderDepartmentSelection() {
  document.body.style.backgroundImage = "url('blankbg.png')";
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.backgroundSize = "contain";
  app.innerHTML = `
    <div>
      <h2>Select Departments</h2>
      <form id="departmentForm">
        ${departments.map(department => `
          <div>
            <label>
              <input type="checkbox" name="department" value="${department}">
              ${department}
            </label>
          </div>
        `).join('')}
        <button type="submit">Next</button>
      </form>
    </div>
  `;

  document.getElementById('departmentForm').onsubmit = (e) => {
    e.preventDefault();
    const selectedDepartments = Array.from(document.querySelectorAll('input[name="department"]:checked')).map(el => el.value);
    handleNextScreen('departmentNumbers', { departments: selectedDepartments });
  };
}

function renderDepartmentNumbers() {
  app.innerHTML = `
    <div>
      <h2>Enter Department Sizes</h2>
      <form id="departmentSizesForm">
        ${schoolData.departments.map(department => `
          <div>
            <label>
              ${department}:
              <input type="number" name="${department}" min="0" required>
            </label>
          </div>
        `).join('')}
        <button type="submit">Next</button>
      </form>
    </div>
  `;

  document.getElementById('departmentSizesForm').onsubmit = (e) => {
    e.preventDefault();
    const departmentNumbers = {};
    schoolData.departments.forEach(department => {
      departmentNumbers[department] = parseInt(document.querySelector(`input[name="${department}"]`).value) || 0;
    });
    handleNextScreen('extraQuestions', { departmentNumbers });
  };
}

function renderExtraQuestions() {
  app.innerHTML = `
    <div>
      <h2>Please answer the following questions to the best of your ability.</h2>
      <form id="extraQuestionsForm">
        <div>
          <label>
            Which month are you interested in calculating the usage of? <br>
            <select id="month" required>
              <option value="">Select month</option>
              ${['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'].map(m => `
                <option value="${m}">${m}</option>
              `).join('')}
            </select>
          </label>
        </div>
        <div>
          <label>
            How many sheets of paper does the average teacher use every week?<br>
            <input type="number" id="avgConsumption" min="0" step="0.01" required>
          </label>
        </div>
        <button type="submit">Next</button>
      </form>
    </div>
  `;

  document.getElementById('extraQuestionsForm').onsubmit = (e) => {
    e.preventDefault();
    const month = document.getElementById('month').value;
    const avgConsumption = parseFloat(document.getElementById('avgConsumption').value);
    handleNextScreen('results', { extraAnswers: { month, avgConsumption } });
  };
}

function renderResults() {
  app.innerHTML = `
    <div>
      <h2>Results for ${schoolData.name}</h2>
      <h3>Monthly Paper Consumption</h3>
      <table class="results-table">
        <thead>
          <tr>
            <th>Department</th>
            <th>Sheets</th>
            <th>Cost (Paper)</th>
            <th>Cost (Ink)</th>
          </tr>
        </thead>
        <tbody>
          ${schoolData.departments.map(dept => `
            <tr>
              <td>${dept}</td>
              <td>${Math.round(schoolData.monthlyResults[dept])}</td>
              <td>$${Math.round(schoolData.monthlyResults[dept] * 0.015)}</td>
              <td>$${Math.round(schoolData.monthlyResults[dept] * 0.05)} - $${Math.round(schoolData.monthlyResults[dept] * 0.15)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <h3>Yearly Paper Consumption</h3>
      <table class="results-table">
        <thead>
          <tr>
            <th>Department</th>
            <th>Sheets</th>
            <th>Cost (Paper)</th>
            <th>Cost (Ink)</th>
          </tr>
        </thead>
        <tbody>
          ${schoolData.departments.map(dept => `
            <tr>
              <td>${dept}</td>
              <td>${Math.round(schoolData.yearlyResults[dept])}</td>
              <td>$${Math.round(schoolData.yearlyResults[dept] * 0.015)}</td>
              <td>$${Math.round(schoolData.yearlyResults[dept] * 0.05)} - $${Math.round(schoolData.yearlyResults[dept] * 0.15)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p>Total Monthly Consumption: ${Math.round(schoolData.totalMonthly)} sheets</p>
      <p>Total Yearly Consumption: ${Math.round(schoolData.totalYearly)} sheets</p>
      <button onclick="handleNextScreen('statistics')">View Statistics</button>
    </div>
  `;
}

function renderStatistics() {
  const environmentalImpact = calculateEnvironmentalImpact(schoolData.totalYearly);
  
  app.innerHTML = `
    <div>
      <h2>Statistics for ${schoolData.name}</h2>
      <p>Sustainability Level: ${schoolData.sustainabilityLevel}</p>
      <p>Suggested Yearly Usage: ${schoolData.suggestedYearlyUsage} reams</p>
      <p>Potential Cost Savings: $${schoolData.potentialSavings}</p>
      <h3>Environmental Impact</h3>
      <table class="results-table">
        <tbody>
          <tr>
            <td>Trees saved:</td>
            <td>${environmentalImpact.trees}</td>
          </tr>
          <tr>
            <td>Water saved:</td>
            <td>${environmentalImpact.water} liters</td>
          </tr>
          <tr>
            <td>CO2 reduction:</td>
            <td>${environmentalImpact.co2} kg</td>
          </tr>
          <tr>
            <td>Solid waste reduction:</td>
            <td>${environmentalImpact.solidWaste} kg</td>
          </tr>
          <tr>
            <td>Air pollutants reduction:</td>
            <td>${environmentalImpact.airPollutants} g</td>
          </tr>
          <tr>
            <td>VOC reduction:</td>
            <td>${environmentalImpact.voc} g</td>
          </tr>
          <tr>
            <td>Energy saved:</td>
            <td>${environmentalImpact.energy} kWh</td>
          </tr>
        </tbody>
      </table>
      <button onclick="currentScreen = 'recommendations'; renderScreen()">View Recommendations</button>
    </div>
  `;
}

function renderRecommendations() {
  switch (schoolData.sustainabilityLevel) {
    case 1:
      document.body.style.backgroundImage = "url('recs-lvl-1.png')";
      break;
    case 2:
      document.body.style.backgroundImage = "url('recs-lvl-2.png')";
      break;
    case 3:
      document.body.style.backgroundImage = "url('recs-lvl-3.png')";
      break;
  }
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.backgroundSize = "contain";
  app.innerHTML = ``;
}

function monthConversion(month) {
  const monthMap = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: -2, December: -1
  };
  return monthMap[month];
}

function calculateDepartmentConsumption(department, month, size, averageConsumption) {
  const monthNum = monthConversion(month);
  let consumption = 0;

  switch (department) {
    case 'Mathematics':
      consumption = 45295.09709507716 * Math.sin(0.6316744364331272 * monthNum + 0.9770763113437054) + 86386.8203950346;
      break;
    case 'Science':
      if (monthNum < 4 && monthNum > -3) {
        consumption = 5738.338611383719 * Math.sin(3.6586713137796387 * monthNum + 1.4441128171185476) + 35500.96169594299;
      } else {
        consumption = 6899 * Math.pow(monthNum, 2) - 85390 * monthNum + 270000;
      }
      break;
    // Add cases for other departments...
    default:
      consumption = 10000; // Default consumption
  }

  return (consumption * size / 100) * (averageConsumption / (5 * ((3374311 / 276) / 180)));
}

function calculateResults(schoolData) {
  const monthlyResults = {};
  const yearlyResults = {};
  let totalMonthly = 0;
  let totalYearly = 0;

  schoolData.departments.forEach(dept => {
    const monthlyConsumption = calculateDepartmentConsumption(
      dept,
      schoolData.extraAnswers.month,
      schoolData.departmentNumbers[dept],
      schoolData.extraAnswers.avgConsumption
    );
    monthlyResults[dept] = monthlyConsumption;
    yearlyResults[dept] = monthlyConsumption * 12;
    totalMonthly += monthlyConsumption;
    totalYearly += monthlyConsumption * 12;
  });

  const sustainabilityLevel = calculateSustainabilityLevel(totalYearly, schoolData.departmentNumbers);
  const suggestedYearlyUsage = Math.round(totalYearly * 0.95 / 500);
  const potentialSavings = Math.round((totalYearly * 0.05 / 500) * 7.5);

  return {
    monthlyResults,
    yearlyResults,
    totalMonthly,
    totalYearly,
    sustainabilityLevel,
    suggestedYearlyUsage,
    potentialSavings,
    treesSaved: Math.round(totalYearly * 0.05 * (0.06 / 500)),
    waterSaved: Math.round(totalYearly * 0.05),
    co2Reduction: Math.round(totalYearly * 0.05 * (6000 / 500) / 1000)
  };
}

function calculateSustainabilityLevel(totalYearly, departmentNumbers) {
  const totalStaff = Object.values(departmentNumbers).reduce((sum, num) => sum + num, 0);
  const averageSchoolConsumption = 1350000 * (totalStaff / 67);
  const sustainableSchoolConsumption = 540000 * (totalStaff / 80);

  if (totalYearly < sustainableSchoolConsumption) {
    return 3; // High sustainability
  } else if (totalYearly < averageSchoolConsumption) {
    return 2; // Medium sustainability
  } else {
    return 1; // Low sustainability
  }
}

function calculateEnvironmentalImpact(totalYearly) {
  return {
    trees: (totalYearly * (0.06 / 500)).toFixed(2),
    water: Math.round(totalYearly),
    solidWaste: Math.round(totalYearly * (2 / 500)),
    co2: Math.round(totalYearly * (6000 / 500)),
    airPollutants: Math.round(totalYearly * (2 / 500)),
    voc: Math.round(totalYearly * (3 / 500)),
    energy: Math.round(totalYearly * (25 / 500))
  };
}

// Start the application
renderScreen();