document.addEventListener('DOMContentLoaded', () => {
    updateActivityList();
    updatePreviousActivityList();
    updateBlockList();
    generateChart();
  
    document.getElementById('startFocus').addEventListener('click', startFocusMode);
    document.getElementById('addBlock').addEventListener('click', addBlockSite);
  });
  
  function updateActivityList() {
    chrome.storage.sync.get(['timeTracker'], data => {
      const activityList = document.getElementById('activityList');
      activityList.innerHTML = '';
      for (let site in data.timeTracker) {
        let li = document.createElement('li');
        li.textContent = `${site}: ${data.timeTracker[site]} minutes`;
        activityList.appendChild(li);
      }
    });
  }
  
  function updatePreviousActivityList() {
    chrome.storage.sync.get(['previousDays'], data => {
      const previousActivityList = document.getElementById('previousActivityList');
      previousActivityList.innerHTML = '';
      for (let day in data.previousDays) {
        let dayList = document.createElement('ul');
        dayList.textContent = day;
        for (let site in data.previousDays[day]) {
          let li = document.createElement('li');
          li.textContent = `${site}: ${data.previousDays[day][site]} minutes`;
          dayList.appendChild(li);
        }
        previousActivityList.appendChild(dayList);
      }
    });
  }
  
  function startFocusMode() {
    let focusDuration = parseInt(document.getElementById('focusDuration').value) || 0;
    let focusEndTime = Date.now() + focusDuration * 60000;
    chrome.storage.sync.set({ focusMode: true, focusEndTime: focusEndTime });
  }
  
  function addBlockSite() {
    let site = document.getElementById('blockSite').value;
    if (site) {
      chrome.storage.sync.get(['blockList'], data => {
        let blockList = data.blockList;
        if (!blockList.includes(site)) {
          blockList.push(site);
          chrome.storage.sync.set({ blockList: blockList }, updateBlockList);
        }
      });
    }
  }
  
  function updateBlockList() {
    chrome.storage.sync.get(['blockList'], data => {
      const blockListElement = document.getElementById('blockList');
      blockListElement.innerHTML = '';
      for (let site of data.blockList) {
        let li = document.createElement('li');
        li.textContent = site;
        let removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => removeBlockSite(site));
        li.appendChild(removeButton);
        blockListElement.appendChild(li);
      }
    });
  }
  
  function removeBlockSite(site) {
    chrome.storage.sync.get(['blockList'], data => {
      let blockList = data.blockList;
      blockList = blockList.filter(item => item !== site);
      chrome.storage.sync.set({ blockList: blockList }, updateBlockList);
    });
  }
  
  function generateChart() {
    chrome.storage.sync.get(['timeTracker'], data => {
      const ctx = document.getElementById('usageChart').getContext('2d');
      const labels = Object.keys(data.timeTracker);
      const values = Object.values(data.timeTracker);
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
          }]
        }
      });
    });
  }
  