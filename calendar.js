const currentYear = new Date().getFullYear();
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'Octomber',
	'November',
	'December'
];
const colors = ['#2d6b5f', '#72e3a6', '#dff4c7', '#edbf98', '#ea3d36'];
const defaultColor = '#888';
let activeColor = '#888';

// select elements
const container = document.querySelector(".container");
const calendar = document.getElementById('calendar');
const moods = document.querySelectorAll('.mood');
const savePDF = document.querySelector('#pdfSave');
const clear = document.querySelector('#clear');
const save = document.querySelector('#save');
const upload = document.querySelector('#upload');
const download = document.querySelector('#download');
const input = document.getElementById('input');


// change title corresponding to current year
container.getElementsByTagName('h2')[0].textContent = `${currentYear} Mood Calendar`;

moods.forEach(mood => {
	mood.addEventListener('click', () => {
		// if is already selected, deselect it
		if (mood.classList.contains('selected')) {
			mood.classList.remove('selected');
			activeColor = defaultColor;
		} else {
			moods.forEach(mood => {
				mood.classList.remove('selected');
			});

			mood.classList.add('selected');
			activeColor = getComputedStyle(mood).getPropertyValue('color');
		}
	});
});


const getAllDays = year => {
	// First day of the year - 1st January
	const firstDay = new Date(`January 1 ${year}`);
	// Last day of the year - 31th December - used to stop adding days to the array
	const lastDay = new Date(`December 31 ${year}`);

	// Add first day
	const days = [firstDay];

	// Used to keep track of the day
	let lastDayInArray = firstDay;
	
	// Loop while there are new days to be added in the current year
	while (lastDayInArray.getTime() !== lastDay.getTime()) {
		days.push(addDays(lastDayInArray, 1));
		lastDayInArray = days[days.length - 1];
	}

	return days;
};

const dates = getAllDays(currentYear);

let monthsHTML = '';

// Loop over the months and create a div for each month
months.forEach((month, idx) => {
	monthsHTML += `<div class="months month_${idx}">
        <h3>${month}</h3>
        <div class="week_days_container">
            ${weekDays.map(day => `<div class="week_days">${day}</div>`)
					  .join('')}
        </div>
        <div class="days_container"></div>
    </div>`;
});

calendar.innerHTML = monthsHTML;

// Loop over each day and
dates.forEach(date => {
	const month = date.getMonth();
	const monthEl = document.querySelector(`.month_${month} .days_container`);

	// create extra day slots if needed before day 1
	if (date.getDate() === 1 && date.getDay() !== 0) {
		for (let i = 0; i < date.getDay(); i++) {
			const emptySpot = createEmptySpot();

			monthEl.appendChild(emptySpot);
		}
	}

	const dateEl = createDateEl(date);

	monthEl.appendChild(dateEl);
});



// Add click event to all the .circles
const circles = document.querySelectorAll('.circle');
circles.forEach(circle => {
	circle.addEventListener('click', () => {
		circle.style.backgroundColor = activeColor;
	});
});


// mood data for local storage
let moodData = {year: currentYear,
    mood: new Array(circles.length).fill(defaultColor)
};

// update local storage data from circles
function updateMoodData() {
	for(let i = 0; i < circles.length; i++) {
		moodData.mood[i] = circles[i].style.backgroundColor || defaultColor;
	}

}

// update circles from local storage
function updateCircles(moodData) {
	for(let i = 0; i < circles.length; i++) {
		circles[i].style.backgroundColor = moodData.mood[i];
	}

}

// load old data if we have
if(localStorage.getItem('moodData') !== null) {
    let data = JSON.parse(localStorage.getItem('moodData'));
    if(data.year === currentYear) {
        moodData = data;
		updateCircles(moodData);
		
    }
}

// save mood data to local storage
save.addEventListener('click', () => {
	// update current mood data first
	updateMoodData(moodData);
	localStorage.setItem('moodData', JSON.stringify(moodData));
});


// Save as PDF
savePDF.addEventListener('click', () => {
	window.print();
});

// Clear functionality
clear.addEventListener('click', () => {
	circles.forEach(circle => {
		circle.style.backgroundColor = defaultColor;
	});
});

// Upload json file to calendar
upload.addEventListener('click', () => {
	input.click();
	
	

});

// error occur when assign more mood to data, save data, then upload
input.onchange = function() {
	const data = input.files[0];
	var reader = new FileReader();
	reader.readAsText(data);
	reader.onload = function() {
		let json = JSON.parse(this.result);
		if(json.year === currentYear) {
			updateCircles(json);
		}

	}
	

}

// Download as json file
download.addEventListener('click', () => {
	updateMoodData();
	const link = document.createElement("a");
	link.href = `data:text/json;charset=utf8,${encodeURIComponent(JSON.stringify(moodData))}`; 
	link.download = `${currentYear}MoodCalendar.json`;    
	link.click();  

});

function createDateEl(date) {
	const day = date.getDate();
	const dateEl = document.createElement('div');
	dateEl.classList.add('days');
	dateEl.innerHTML = `<span class="circle">${day}</span>`;
	return dateEl;
}

function createEmptySpot() {
	const emptyEl = document.createElement('div');
	emptyEl.classList.add('days');
	return emptyEl;
}

function addDays(date, days) {
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}






