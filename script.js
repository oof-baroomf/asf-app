const app = document.getElementById('app');
const pb = new PocketBase('http://127.0.0.1:8090');
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

async function handleNextScreen(nextScreen, data) {
  schoolData = { ...schoolData, ...data };

  if (nextScreen === 'results') {
    const results = calculateResults(schoolData);
    schoolData = { ...schoolData, ...results };
    
    // Add the school data to the database
    try {
      // Authenticate before making the API call
      await pb.admins.authWithPassword('4s9r1.pocketbase@inbox.testmail.app', 'asdf09871234;lkj');
      const record = await pb.collection('schools').create({
        name: schoolData.name,
        departments: JSON.stringify(schoolData.departments),
        departmentNumbers: JSON.stringify(schoolData.departmentNumbers),
        extraAnswers: JSON.stringify(schoolData.extraAnswers),
        monthlyResults: JSON.stringify(schoolData.monthlyResults),
        yearlyResults: JSON.stringify(schoolData.yearlyResults),
        totalMonthly: schoolData.totalMonthly,
        totalYearly: schoolData.totalYearly,
        sustainabilityLevel: schoolData.sustainabilityLevel,
        suggestedYearlyUsage: schoolData.suggestedYearlyUsage,
        potentialSavings: schoolData.potentialSavings
      });
      console.log('School data added to database:', record);
    } catch (error) {
      console.error('Error adding school data to database:', error);
    }
  }

  currentScreen = nextScreen;
  renderScreen();
}

function renderInitializationScreen() {
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: flex-end; height: 70vh;">
      <img src="logo.png" alt="Paper Consumption Model Logo" style="width: 50%; max-width: 200px; margin: 0 auto 3vw;">
      <h1 style="font-size: clamp(36px, 6vw, 72px); margin-bottom: 4vw;">Paper Consumption Model</h1>
      <button onclick="handleNextScreen('schoolName')" style="width: auto; min-width: 160px; padding: 15px 30px; margin: 0 auto 30px; font-size: clamp(24px, 4vw, 36px);">Start</button>
    </div>
  `;
}

async function renderSchoolNameInput() {
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: flex-end; height: 70vh;">
      <form id="schoolNameForm">
        <img src="logo.png" alt="Paper Consumption Model Logo" style="width: 50%; max-width: 200px; margin: 0 auto 3vw;">
        <h1 style="font-size: clamp(36px, 6vw, 72px);">Name of School:</h1>
        <br>
        <input type="text" id="schoolName" required style="width: 70%; max-width: 500px; margin: 0 auto 20px; font-size: clamp(24px, 4vw, 32px); padding: 10px;">
        <br>
        <div id="searchResults" style="max-height: 200px; overflow-y: auto; margin-bottom: 20px;"></div>
        <button type="submit" style="width: auto; min-width: 160px; padding: 15px 30px; margin: 0 auto; font-size: clamp(14px, 4vw, 36px);">Next</button>
      </form>
    </div>
  `;

  const schoolNameInput = document.getElementById('schoolName');
  const searchResults = document.getElementById('searchResults');
  const schoolNameForm = document.getElementById('schoolNameForm');

  schoolNameInput.addEventListener('input', async (e) => {
    const searchTerm = e.target.value;
    if (searchTerm.length > 2) {
      try {
        const resultList = await pb.collection('schools').getList(1, 5, {
          filter: `name ~ "${searchTerm}"`
        });
        
        searchResults.innerHTML = resultList.items.map(school => `
          <div style="cursor: pointer; padding: 10px; border-bottom: 1px solid #ddd;" onclick="selectExistingSchool('${school.id}')">
            ${school.name}
          </div>
        `).join('');
      } catch (error) {
        console.error('Error searching for schools:', error);
      }
    } else {
      searchResults.innerHTML = '';
    }
  });

  schoolNameForm.onsubmit = (e) => {
    e.preventDefault();
    handleNextScreen('departmentSelection', { name: schoolNameInput.value });
  };
}

async function selectExistingSchool(schoolId) {
  try {
    const school = await pb.collection('schools').getOne(schoolId);
    schoolData = {
      ...school,
      departments: JSON.parse(school.departments),
      departmentNumbers: JSON.parse(school.departmentNumbers),
      extraAnswers: JSON.parse(school.extraAnswers),
      monthlyResults: JSON.parse(school.monthlyResults),
      yearlyResults: JSON.parse(school.yearlyResults)
    };
    handleNextScreen('results');
  } catch (error) {
    console.error('Error fetching school data:', error);
  }
}

function renderDepartmentSelection() {
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: flex-start; min-height: 100vh; padding: 20px;">
      <img src="logo.png" alt="Paper Consumption Model Logo" style="width: 50%; max-width: 200px; margin: 0 auto 2vw;">
      <h1 style="font-size: clamp(32px, 5vw, 64px); margin-bottom: 3vw;">Select Departments</h1>
      <form id="departmentForm" style="width: 90%; max-width: 500px; margin: 0 auto;">
        ${departments.map(department => `
          <div style="text-align: left; margin-bottom: 8px;">
            <label style="font-size: clamp(18px, 3vw, 32px);">
              <input type="checkbox" name="department" value="${department}" style="margin-right: 8px; font-size: clamp(18px, 3vw, 32px);">
              ${department}
            </label>
          </div>
        `).join('')}
        <button type="submit" style="width: auto; min-width: 140px; padding: 12px 24px; margin: 20px auto 0; font-size: clamp(20px, 3.5vw, 32px);">Next</button>
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
    <div style="display: flex; flex-direction: column; justify-content: flex-start; min-height: 100vh; padding: 20px;">
      <img src="logo.png" alt="Paper Consumption Model Logo" style="width: 50%; max-width: 200px; margin: 0 auto 2vw;">
      <h1 style="font-size: clamp(32px, 5vw, 64px); margin-bottom: 3vw;">Enter Department Sizes</h1>
      <form id="departmentSizesForm" style="width: 90%; max-width: 500px; margin: 0 auto;">
        ${schoolData.departments.map(department => `
          <div style="text-align: left; margin-bottom: 8px;">
            <label style="font-size: clamp(18px, 3vw, 32px);">
              ${department}:
              <input type="number" name="${department}" min="0" required style="width: 100%; margin-top: 5px; font-size: clamp(18px, 3vw, 32px); padding: 8px;">
            </label>
          </div>
        `).join('')}
        <button type="submit" style="width: auto; min-width: 140px; padding: 12px 24px; margin: 20px auto 0; font-size: clamp(20px, 3.5vw, 32px);">Next</button>
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
    <div style="display: flex; flex-direction: column; justify-content: flex-start; min-height: 100vh; padding: 20px;">
      <img src="logo.png" alt="Paper Consumption Model Logo" style="width: 50%; max-width: 200px; margin: 0 auto 2vw;">
      <h1 style="font-size: clamp(32px, 5vw, 64px); margin-bottom: 3vw;">Additional Questions</h1>
      <form id="extraQuestionsForm" style="width: 90%; max-width: 500px; margin: 0 auto;">
        <div style="text-align: left; margin-bottom: 16px;">
          <label style="font-size: clamp(18px, 3vw, 32px); margin-bottom: 10px; display: block;">
            Which month are you interested in calculating the usage of?
          </label>
          <select id="month" required style="width: 100%; font-size: clamp(18px, 3vw, 24px); padding: 12px;">
            <option value="">Select month</option>
            ${['January', 'February', 'March', 'April', 'May', 'June', 
               'July', 'August', 'September', 'October', 'November', 'December'].map(m => `
              <option value="${m}">${m}</option>
            `).join('')}
          </select>
        </div>
        <div style="text-align: left; margin-bottom: 16px;">
          <label style="font-size: clamp(18px, 3vw, 32px); margin-bottom: 10px; display: block;">
            How many sheets of paper does the average teacher use every week?
          </label>
          <input type="number" id="avgConsumption" min="0" step="0.01" required style="width: 100%; font-size: clamp(18px, 3vw, 24px); padding: 12px;">
        </div>
        <button type="submit" style="width: auto; min-width: 140px; padding: 12px 24px; margin: 20px auto 0; font-size: clamp(20px, 3.5vw, 32px);">Next</button>
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
    <div style="display: flex; flex-direction: column; justify-content: flex-start; min-height: 100vh; padding: 20px;">
      <img src="logo.png" alt="Paper Consumption Model Logo" style="width: 50%; max-width: 200px; margin: 0 auto 2vw;">
      <h1 style="font-size: clamp(32px, 5vw, 64px); margin-bottom: 3vw;">Results for ${schoolData.name}</h1>
      <h3 style="font-size: clamp(24px, 4vw, 48px); margin-bottom: 2vw;">Monthly Paper Consumption</h3>
      <table class="results-table" style="font-size: clamp(16px, 2.5vw, 24px);">
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
              <td>${Number(Math.round(schoolData.monthlyResults[dept])).toLocaleString(undefined, {maximumSignificantDigits: 5})}</td>
              <td>$${Number(Math.round(schoolData.monthlyResults[dept] * 0.015)).toLocaleString(undefined, {maximumSignificantDigits: 5})}</td>
              <td>$${Number(Math.round(schoolData.monthlyResults[dept] * 0.05)).toLocaleString(undefined, {maximumSignificantDigits: 5})} - $${Number(Math.round(schoolData.monthlyResults[dept] * 0.15)).toLocaleString(undefined, {maximumSignificantDigits: 5})}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <h3 style="font-size: clamp(24px, 4vw, 48px); margin-top: 3vw; margin-bottom: 2vw;">Yearly Paper Consumption</h3>
      <table class="results-table" style="font-size: clamp(16px, 2.5vw, 24px);">
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
              <td>${Number(Math.round(schoolData.yearlyResults[dept])).toLocaleString(undefined, {maximumSignificantDigits: 5})}</td>
              <td>$${Number(Math.round(schoolData.yearlyResults[dept] * 0.015)).toLocaleString(undefined, {maximumSignificantDigits: 5})}</td>
              <td>$${Number(Math.round(schoolData.yearlyResults[dept] * 0.05)).toLocaleString(undefined, {maximumSignificantDigits: 5})} - $${Number(Math.round(schoolData.yearlyResults[dept] * 0.15)).toLocaleString(undefined, {maximumSignificantDigits: 5})}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p style="font-size: clamp(18px, 3vw, 32px); margin-top: 2vw;">Total Monthly Consumption: ${Number(Math.round(schoolData.totalMonthly)).toLocaleString(undefined, {maximumSignificantDigits: 5})} sheets</p>
      <p style="font-size: clamp(18px, 3vw, 32px); margin-bottom: 2vw;">Total Yearly Consumption: ${Number(Math.round(schoolData.totalYearly)).toLocaleString(undefined, {maximumSignificantDigits: 5})} sheets</p>
      <div id="consumptionGraph" style="width:100%; height:400px;"></div>
      <button onclick="handleNextScreen('statistics')" style="width: auto; min-width: 140px; padding: 12px 24px; margin: 20px auto 0; font-size: clamp(20px, 3.5vw, 32px);">View Statistics</button>
    </div>
  `;

  // Generate consumption data for each month
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const consumptionData = months.map(month => {
    return schoolData.departments.reduce((total, dept) => {
      return total + calculateDepartmentConsumption(
        dept,
        month,
        schoolData.departmentNumbers[dept],
        schoolData.extraAnswers.avgConsumption
      );
    }, 0);
  });

  // Create the graph using Plotly
  Plotly.newPlot('consumptionGraph', [{
    x: months,
    y: consumptionData,
    type: 'scatter'
  }], {
    title: 'Monthly Paper Consumption',
    xaxis: { title: 'Month' },
    yaxis: { title: 'Sheets of Paper' }
  });
}

function renderStatistics() {
  const environmentalImpact = calculateEnvironmentalImpact(schoolData.totalYearly);
  
  app.innerHTML = `
    <div>
      <h2 style="font-size: clamp(32px, 5vw, 64px); margin-top: 3vw; margin-bottom: 2vw;">Statistics for ${schoolData.name}</h2>
      <table class="results-table" style="font-size: clamp(16px, 2.5vw, 24px);">
        <tbody>
          <tr>
            <td>Sustainability Level:</td>
            <td>${schoolData.sustainabilityLevel}</td>
          </tr>
          <tr>
            <td>Suggested Yearly Usage:</td>
            <td>${Number(schoolData.suggestedYearlyUsage).toLocaleString(undefined, {maximumSignificantDigits: 5})} reams</td>
          </tr>
          <tr>
            <td>Potential Cost Savings:</td>
            <td>$${Number(schoolData.potentialSavings).toLocaleString(undefined, {maximumSignificantDigits: 5})}</td>
          </tr>
        </tbody>
      </table>
      <h3 style="font-size: clamp(24px, 4vw, 48px); margin-top: 3vw; margin-bottom: 2vw;">Environmental Impact if changes are implemented</h3>
      <table class="results-table" style="font-size: clamp(16px, 2.5vw, 24px);">
        <tbody>
          <tr>
            <td>Trees saved:</td>
            <td>${Number(environmentalImpact.trees).toLocaleString(undefined, {maximumSignificantDigits: 5})}</td>
          </tr>
          <tr>
            <td>Water saved:</td>
            <td>${Number(environmentalImpact.water).toLocaleString(undefined, {maximumSignificantDigits: 5})} liters</td>
          </tr>
          <tr>
            <td>CO2 reduction:</td>
            <td>${Number(environmentalImpact.co2).toLocaleString(undefined, {maximumSignificantDigits: 5})} kg</td>
          </tr>
          <tr>
            <td>Solid waste reduction:</td>
            <td>${Number(environmentalImpact.solidWaste).toLocaleString(undefined, {maximumSignificantDigits: 5})} kg</td>
          </tr>
          <tr>
            <td>Air pollutants reduction:</td>
            <td>${Number(environmentalImpact.airPollutants).toLocaleString(undefined, {maximumSignificantDigits: 5})} g</td>
          </tr>
          <tr>
            <td>VOC reduction:</td>
            <td>${Number(environmentalImpact.voc).toLocaleString(undefined, {maximumSignificantDigits: 5})} g</td>
          </tr>
          <tr>
            <td>Energy saved:</td>
            <td>${Number(environmentalImpact.energy).toLocaleString(undefined, {maximumSignificantDigits: 5})} kWh</td>
          </tr>
        </tbody>
      </table>
      <button onclick="handleNextScreen('recommendations')" style="width: auto; min-width: 140px; padding: 12px 24px; margin: 20px auto 0; font-size: clamp(20px, 3.5vw, 32px);">View Recommendations</button>
    </div>
  `;
}

function renderRecommendations() {
  let content = `
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="logo.png" alt="Paper Consumption Model Logo" style="max-width: 200px; height: auto;">
      </div>
  `;

  switch (schoolData.sustainabilityLevel) {
    case 1:
      content += `
        <h2 style="font-size: clamp(28px, 4.5vw, 48px);">LEVEL ONE RECOMMENDATIONS:</h2>
        <ul style="text-align: left; font-size: clamp(18px, 3vw, 28px); list-style-type: disc; padding-left: 5vw;">
          <li>Adopt a school "Paper Use Reduction" goal and policy that promotes the use of electronic media and incorporates paper use reduction requirements, such as double-sided copying and printing.</li>
          <li>Change the default setting of all photocopiers and printers to double-sided copying.</li>
          <li>Post signs to promote double-sided copying and reuse one-sided prints.</li>
          <li>Educate staff & students about the environmental and economic impact of paper and ways to conserve.</li>
          <li>Promote sustainable consumption habits, such as recycling.</li>
          <li>Host recurring, or annual, school assemblies to promote sustainability.</li>
          <li>Ensure an easily-accessible and clearly-labeled recycling bin ecosystem can be accessed throughout the school.</li>
          <li>Choose paper products that contain recycled content, including office paper, paper towels, and napkins.</li>
          <li>Centralize purchasing to reduce unnecessary purchases and ensure that waste reduction purchasing policies are followed.</li>
          <li>A budgeting plan developed from this model may be used to optimize ordering.</li>
          <li>Consider installing hand dryers in restrooms instead of paper towel dispensers.</li>
          <li>Start a school "material exchange" or "paper bin" for scrap paper.</li>
          <li>Consider using technological alternatives to traditional paper.</li>
        </ul>
      `;
      break;
    case 2:
      content += `
        <h2 style="font-size: clamp(28px, 4.5vw, 48px);">LEVEL TWO RECOMMENDATIONS:</h2>
        <ul style="text-align: left; font-size: clamp(18px, 3vw, 28px); list-style-type: disc; padding-left: 5vw;">
          <li>Adopt a school "Paper Use Reduction" policy that promotes the use of electronic media and incorporates paper use reduction requirements, such as default double-sided copying and printing</li>
          <li>Encourage faculty to avoid extraneous prints</li>
          <li>Educate staff & students about the environmental and economic impact of paper and promote sustainable consumption & conservation habits</li>
          <li>Host recurring/annual schools assemblies and presentations on sustainability</li>
          <li>Ensure an easily-accessible and clearly-labeled recycling bin ecosystem can be accessed throughout the school</li>
          <li>Centralize purchasing to reduce unnecessary purchases</li>
          <li>A budgeting plan developed from this model may be used to optimize ordering</li>
          <li>Consider using alternatives to paper materials, such as:
            <ul>
              <li>Physical textbooks → digital subscriptions</li>
              <li>Do-nows & check-ins → digital forms (Google Suite, Office 365, etc.)</li>
              <li>Paper handouts & notes → online documents, projector & whiteboard usage</li>
            </ul>
          </li>
          <li>Provide students with the flexibility to opt-digital</li>
          <li>Create lesson plans that account for technological alternatives</li>
          <li>Ensure school WiFi is reliable and scalable</li>
          <li>Choose paper products that contain recycled content for all paper products, including lunch trays, paper towels, toilet paper, and napkins</li>
        </ul>
      `;
      break;
    case 3:
      content += `
        <h2 style="font-size: clamp(28px, 4.5vw, 48px);">LEVEL THREE RECOMMENDATIONS:</h2>
        <ul style="text-align: left; font-size: clamp(18px, 3vw, 28px); list-style-type: disc; padding-left: 5vw;">
          <li>Adopt a school "Paper Use Reduction" policy that promotes the use of electronic media and incorporates paper use reduction requirements, such as default double-sided copying and printing</li>
          <li>Encourage faculty to avoid extraneous prints and reuse any single prints</li>
          <li>A budgeting plan developed from this model may be used to optimize ordering</li>
          <li>Educate staff & students about the environmental + economic impact of paper while investing in proactive, environmentally-friendly conservation practices</li>
          <li>Host recurring/annual schools assemblies and presentations on sustainability</li>
          <li>Ensure an easily-accessible and clearly-labeled recycling bin ecosystem can be accessed throughout the school</li>
          <li>Design a school-based environmental-science course and encourage students to launch environmental initiatives</li>
          <li>Develop a sustainable composting & gardening system</li>
          <li>Host school-wide environment volunteer events (trash clean-ups, wildlife observation, nature walks, etc.)</li>
          <li>Heavily promote the usage of technological alternatives, through…
            <ul>
              <li>Promoting the use of online resources</li>
              <li>Develop strong Tech Education staffing</li>
              <li>Ensuring school Wifi is reliable, secure, and scalable</li>
            </ul>
          </li>
          <li>Choose paper products that contain recycled content for all paper products, including lunch trays, paper towels, toilet paper, and napkins</li>
        </ul>
      `;
      break;
  }
 
  app.innerHTML = content;
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
    case 'Social Studies':
      if (monthNum < 3 && monthNum > -3) {
        consumption = 13735.179526026364 * Math.sin(3.8076010830826803 * monthNum + 1.5129078154768665) + 51515.42154376031;
      } else {
        consumption = 8166 * Math.pow(monthNum, 2) - 91610 * monthNum + 266500;
      }
      break;
    case 'English':
      if (monthNum < 4 && monthNum > -3) {
        consumption = 21397.1666667;
      } else {
        consumption = 4956 * Math.pow(monthNum, 2) - 60770 * monthNum + 189400;
      }
      break;
    case 'World Language':
      consumption = 17818.6116335868 * Math.sin(0.7699694201104257 * monthNum + 0.34801326652248404) + 27771.56628346566;
      break;
    case 'Arts':
      if (monthNum < 3 && monthNum > -3) {
        consumption = 8981.318218040968 * Math.sin(4.317962147957993 * monthNum + 1.6935954028997533) + 9042.867675829411;
      } else {
        consumption = 1920 * Math.pow(monthNum, 2) - 21630 * monthNum + 62460;
      }
      break;
    case 'Business/Technology':
      consumption = 6282.442154743634 * Math.sin(0.6028667044099567 * monthNum + 1.142342198647614) + 9987.900340859784;
      break;
    case 'Administration':
      consumption = 30140 / 12;
      break;
    case 'Guidance':
      if (monthNum < 4 && monthNum > -3) {
        consumption = 7388.231315998524 * Math.sin(3.640171919699752 * monthNum + 0.23940768328952233) + 15449.025632352255;
      } else {
        consumption = 5934 * Math.pow(monthNum, 2) - 68860 * monthNum + 203100;
      }
      break;
    case 'Health Office':
      let PE_Equation = 2004.342509328292 * Math.sin(1.4273978025454321 * monthNum + 0.6073619213579808) + 5155.40000013813;
      let PE, Nurse;
      if ((monthNum > -3 && monthNum < 5) || monthNum == 9) {
        PE = PE_Equation;
      } else {
        PE = 2246 * Math.pow(monthNum, 2) - 27970 * monthNum + 89040;
      }
      let Nurse_Equation = 283.1429525962092 * Math.sin(1.3538340782171647 * monthNum + -3.9325357041709066) + 355.0518482018964;
      Nurse = 2246 * Math.pow(monthNum, 2) - 27970 * monthNum + 89040;
      consumption = PE + Nurse;
      break;
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