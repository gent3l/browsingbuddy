document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('setGoal').addEventListener('click', setGoal);
    updateGoalList();
    updateReportList();
  });
  
  function setGoal() {
    let site = document.getElementById('siteGoal').value;
    let time = parseInt(document.getElementById('timeGoal').value) || 0;
    if (site && time) {
      chrome.storage.sync.get(['goals'], data => {
        let goals = data.goals || {};
        goals[site] = time;
        chrome.storage.sync.set({ goals: goals }, updateGoalList);
      });
    }
  }
  
  function updateGoalList() {
    chrome.storage.sync.get(['goals'], data => {
      const goalList = document.getElementById('goalList');
      goalList.innerHTML = '';
      for (let site in data.goals) {
        let li = document.createElement('li');
        li.textContent = `${site}: ${data.goals[site]} minutes/day`;
        goalList.appendChild(li);
      }
    });
  }
  
  function updateReportList() {
    chrome.storage.sync.get(['previousDays'], data => {
      const reportList = document.getElementById('reportList');
      reportList.innerHTML = '';
      for (let day in data.previousDays) {
        let dayList = document.createElement('ul');
        dayList.textContent = day;
        for (let site in data.previousDays[day]) {
          let li = document.createElement('li');
          li.textContent = `${site}: ${data.previousDays[day][site]} minutes`;
          dayList.appendChild(li);
        }
        reportList.appendChild(dayList);
      }
    });
  }
  