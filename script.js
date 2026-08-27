/* =========================================
   LÓGICA DO APP (JavaScript)
   6º Semestre - Calculadora de Faltas
   ========================================= */

const subjectAcronyms = {
    'go': 'GO',
    'sai': 'SAI',
    'ped': 'PED',
    'pesquisa': 'PESQUISA',
    'projeto': 'PROJETO',
    'med_com': 'MED E COM'
};

const subjectFullNames = {
    'go': 'GO',
    'sai': 'SAI',
    'ped': 'PED',
    'pesquisa': 'Pesquisa',
    'projeto': 'Projeto',
    'med_com': 'Med. e Comunidade'
};

// Horários do 6º Semestre - conforme grade
const weeklySchedule = {
    // Segunda-feira (1)
    1: [
        { time: '7h30-8h20', code: 'go' },
        { time: '8h20-9h10', code: 'go' },
        { time: '10h-10h50', code: 'sai' },
        { time: '10h50-11h40', code: 'sai' },
        { time: '13h30-14h20', code: 'sai' },
        { time: '14h20-15h10', code: 'sai' },
        { time: '15h10-16h', code: 'sai' }
    ],
    // Terça-feira (2)
    2: [
        { time: '13h30-14h20', code: 'ped' },
        { time: '14h20-15h10', code: 'ped' },
        { time: '15h10-16h', code: 'go' },
        { time: '16h-16h50', code: 'go' },
        { time: '16h50-17h40', code: 'sai' }
    ],
    // Quarta-feira (3)
    3: [
        { time: '8h20-9h10', code: 'ped' },
        { time: '9h10-10h', code: 'ped' }
    ],
    // Quinta-feira (4)
    4: [
        { time: '7h30-8h20', code: 'sai' },
        { time: '8h20-9h10', code: 'sai' },
        { time: '13h30-14h20', code: 'pesquisa' },
        { time: '14h20-15h10', code: 'pesquisa' },
        { time: '15h10-16h', code: 'pesquisa' },
        { time: '16h-16h50', code: 'projeto' },
        { time: '16h50-17h40', code: 'projeto' },
        { time: '17h40-18h30', code: 'projeto' }
    ],
    // Sexta-feira (5)
    5: [
        { time: '8h20-9h10', code: 'med_com' },
        { time: '9h10-10h', code: 'med_com' },
        { time: '10h-10h50', code: 'med_com' },
        { time: '10h50-11h40', code: 'med_com' },
        { time: '13h30-14h20', code: 'sai' },
        { time: '14h20-15h10', code: 'sai' },
        { time: '15h10-16h', code: 'sai' }
    ]
};

// Aulas e dias por semana para cálculo de limite de faltas
const TOTAL_WEEKS = 20;
const REQUIRED_ATTENDANCE = 0.75; // 75% presença -> 25% faltas permitidas

const classesAndDaysPerWeek = {
    'go': { classes: 4, days: 2 },
    'sai': { classes: 11, days: 4 },
    'ped': { classes: 4, days: 2 },
    'pesquisa': { classes: 3, days: 1 },
    'projeto': { classes: 3, days: 1 },
    'med_com': { classes: 4, days: 1 }
};

function calcLimit(perWeek) {
    const total = perWeek * TOTAL_WEEKS;
    return Math.floor(total * (1 - REQUIRED_ATTENDANCE));
}

const subjectsData = {};
for (const [code, info] of Object.entries(classesAndDaysPerWeek)) {
    subjectsData[code] = {
        name: subjectFullNames[code],
        classesLimit: calcLimit(info.classes),
        daysLimit: calcLimit(info.days),
        totalClasses: info.classes * TOTAL_WEEKS,
        totalDays: info.days * TOTAL_WEEKS,
        classesPerWeek: info.classes,
        daysPerWeek: info.days
    };
}

let absences = new Set(JSON.parse(localStorage.getItem('absences_db') || '[]'));

function saveAbsences() {
    localStorage.setItem('absences_db', JSON.stringify(Array.from(absences)));
    if(document.getElementById('tab-summary').classList.contains('active')) {
        renderSummary();
    }
}

function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getMonday(d) {
    let date = new Date(d);
    let day = date.getDay();
    let diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
}

let today = new Date();
today.setHours(0,0,0,0);

let selectedDate = new Date(today);
if (selectedDate.getDay() === 0) selectedDate.setDate(selectedDate.getDate() + 1);
if (selectedDate.getDay() === 6) selectedDate.setDate(selectedDate.getDate() - 1);

let selectedWeekMonday = getMonday(selectedDate);
let pickerDate = new Date(selectedDate);

const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

function prevWeek() {
    selectedDate.setDate(selectedDate.getDate() - 7);
    if (selectedDate.getFullYear() < 2026) {
        selectedDate.setFullYear(2026);
        selectedDate.setMonth(0);
        selectedDate.setDate(1);
    }
    selectedWeekMonday = getMonday(selectedDate);
    renderCalendarTab();
}

function nextWeek() {
    selectedDate.setDate(selectedDate.getDate() + 7);
    if (selectedDate.getFullYear() > 2026 || (selectedDate.getFullYear() === 2026 && selectedDate.getMonth() > 11)) {
        selectedDate.setFullYear(2026);
        selectedDate.setMonth(11);
        selectedDate.setDate(31);
    }
    selectedWeekMonday = getMonday(selectedDate);
    renderCalendarTab();
}

function goToToday() {
    selectedDate = new Date();
    selectedDate.setHours(0,0,0,0);
    if (selectedDate.getDay() === 0) selectedDate.setDate(selectedDate.getDate() + 1);
    if (selectedDate.getDay() === 6) selectedDate.setDate(selectedDate.getDate() - 1);
    selectedWeekMonday = getMonday(selectedDate);
    renderCalendarTab();
}

function toggleDatePicker() {
    const overlay = document.getElementById('date-picker-overlay');
    const isVisible = overlay.style.display === 'flex';
    if (!isVisible) {
        overlay.style.display = 'flex';
        pickerDate = new Date(selectedDate);
        pickerDate.setDate(1);
        renderDatePickerGrid(pickerDate);
    } else {
        overlay.style.display = 'none';
    }
}

function prevMonthPicker() {
    pickerDate.setMonth(pickerDate.getMonth() - 1);
    renderDatePickerGrid(pickerDate);
}

function nextMonthPicker() {
    pickerDate.setMonth(pickerDate.getMonth() + 1);
    renderDatePickerGrid(pickerDate);
}

function renderDatePickerGrid(referenceDate) {
    const grid = document.getElementById('date-picker-grid');
    grid.innerHTML = '';

    document.getElementById('date-picker-month-year').innerText = `${meses[referenceDate.getMonth()]} ${referenceDate.getFullYear()}`;

    const firstDayOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const lastDayOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
    const numDaysInMonth = lastDayOfMonth.getDate();
    const startDay = firstDayOfMonth.getDay();

    const dayHeaders = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    dayHeaders.forEach(day => {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'day-header';
        headerDiv.innerText = day;
        grid.appendChild(headerDiv);
    });

    for (let i = 0; i < startDay; i++) {
        grid.appendChild(document.createElement('div'));
    }

    for (let i = 1; i <= numDaysInMonth; i++) {
        let currentDayLoop = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), i);
        let dayOfWeek = currentDayLoop.getDay();
        const dateString = getLocalDateString(currentDayLoop);

        const dayDiv = document.createElement('div');
        dayDiv.innerText = i;

        if (dayOfWeek === 0 || dayOfWeek === 6) {
            dayDiv.className = 'disabled-day';
        } else {
            if (dateString === getLocalDateString(today)) dayDiv.classList.add('today');

            let hasAbsences = false;
            absences.forEach(id => {
                if (id.startsWith(dateString)) hasAbsences = true;
            });

            if (hasAbsences) dayDiv.classList.add('missed-class');
            dayDiv.onclick = () => selectDatePickerDay(currentDayLoop);
        }
        grid.appendChild(dayDiv);
    }
}

function selectDatePickerDay(date) {
    if (date.getDay() === 0 || date.getDay() === 6) return;
    selectedWeekMonday = getMonday(date);
    selectedDate = date;
    toggleDatePicker();
    renderCalendarTab();
}

function renderCalendarTab() {
    const monthText = meses[selectedDate.getMonth()];
    const yearText = selectedDate.getFullYear();
    document.getElementById('month-year-text').innerText = `${monthText} ${yearText}`;

    const startDate = new Date(selectedWeekMonday);
    const endDate = new Date(selectedWeekMonday);
    endDate.setDate(selectedWeekMonday.getDate() + 4);
    const startDay = startDate.getDate().toString().padStart(2, '0');
    const endDay = endDate.getDate().toString().padStart(2, '0');
    document.getElementById('week-range-text').innerText = `semana ${startDay}-${endDay}`;

    const minWeekMonday = getMonday(new Date(2026, 0, 1));
    const maxWeekMonday = getMonday(new Date(2026, 11, 31));

    document.getElementById('btn-prev-week').disabled = (selectedWeekMonday <= minWeekMonday);
    document.getElementById('btn-next-week').disabled = (selectedWeekMonday >= maxWeekMonday);

    renderDateCarousel();
    renderClassesForSelectedDate();
}

function renderDateCarousel() {
    const carousel = document.getElementById('date-carousel');
    carousel.innerHTML = '';

    const dayLabels = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];

    for (let i = 0; i < 5; i++) {
        const currentDayDate = new Date(selectedWeekMonday);
        currentDayDate.setDate(selectedWeekMonday.getDate() + i);

        const itemDiv = document.createElement('div');
        itemDiv.className = `date-carousel-item ${getLocalDateString(selectedDate) === getLocalDateString(currentDayDate) ? 'active' : ''}`;
        itemDiv.onclick = () => {
            selectedDate = new Date(currentDayDate);
            renderCalendarTab();
        };

        const h4 = document.createElement('h4');
        h4.innerText = dayLabels[i];
        itemDiv.appendChild(h4);

        const span = document.createElement('span');
        span.innerText = currentDayDate.getDate().toString().padStart(2, '0');
        itemDiv.appendChild(span);

        carousel.appendChild(itemDiv);
    }
}

function renderClassesForSelectedDate() {
    const container = document.getElementById('calendar-container');
    container.innerHTML = '';

    const dayNumber = selectedDate.getDay();
    const dateString = getLocalDateString(selectedDate);
    const dayClasses = weeklySchedule[dayNumber];

    if (dayClasses && dayClasses.length > 0) {
        dayClasses.forEach(cls => {
            const uniqueId = `${dateString}__${cls.time}__${cls.code}`;
            
            // Validate if class exists in current schedule (safeguard)
            const classExists = weeklySchedule[dayNumber].some(c => c.time === cls.time && c.code === cls.code);
            if (!classExists) return;

            const isMissed = absences.has(uniqueId);
            const shortName = subjectAcronyms[cls.code];

            const card = document.createElement('div');
            card.className = `class-card ${isMissed ? 'missed' : ''}`;
            card.setAttribute('data-subject', cls.code);
            card.onclick = () => toggleAbsence(card, uniqueId);

            card.innerHTML = `
                <p>${cls.time}</p>
                <h4>${shortName}</h4>
                <div class="absence-mark"></div>
            `;
            container.appendChild(card);
        });
    } else {
        const card = document.createElement('div');
        card.className = 'no-class-card';
        card.innerHTML = `Sem aulas hoje!`;
        container.appendChild(card);
    }
}

function toggleAbsence(cardElement, uniqueId) {
    if (absences.has(uniqueId)) {
        absences.delete(uniqueId);
        cardElement.classList.remove('missed');
    } else {
        absences.add(uniqueId);
        cardElement.classList.add('missed');
    }
    saveAbsences();
}

function formatDateBR(dateStr) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

function renderSummary() {
    const container = document.getElementById('summary-container');
    container.innerHTML = '';

    const currentClassesMissedCount = {};
    const missedDaysSetBySubject = {};
    const absencesBySubject = {};
    
    Object.keys(subjectsData).forEach(key => {
        currentClassesMissedCount[key] = 0;
        missedDaysSetBySubject[key] = new Set();
        absencesBySubject[key] = [];
    });

    const invalidAbsences = [];

    absences.forEach(id => {
        const parts = id.split('__');
        if (parts.length === 3) {
            const dateStr = parts[0];
            const timeStr = parts[1];
            const subjectCode = parts[2];
            
            // Validate if the absence belongs to a valid class in the current schedule
            const dateObj = new Date(dateStr + "T12:00:00");
            const dayOfWeek = dateObj.getDay();
            
            const dayClasses = weeklySchedule[dayOfWeek];
            const isValid = dayClasses && dayClasses.some(cls => cls.time === timeStr && cls.code === subjectCode);

            if (isValid && currentClassesMissedCount[subjectCode] !== undefined) {
                currentClassesMissedCount[subjectCode]++;
                missedDaysSetBySubject[subjectCode].add(dateStr);
                absencesBySubject[subjectCode].push({
                    date: dateStr,
                    time: timeStr
                });
            } else {
                // If it's not valid anymore, keep track to remove it and fix local DB
                invalidAbsences.push(id);
            }
        } else {
            invalidAbsences.push(id);
        }
    });

    // Cleanup old/invalid data from previous semesters or schedules
    if (invalidAbsences.length > 0) {
        invalidAbsences.forEach(id => absences.delete(id));
        saveAbsences(); // updates localStorage without invalid data
    }

    // Sort subjects: most percentage of missed days first
    const sortedSubjects = Object.entries(subjectsData).sort((a, b) => {
        const missedDaysA = missedDaysSetBySubject[a[0]].size;
        const missedDaysB = missedDaysSetBySubject[b[0]].size;
        const ratioA = missedDaysA / a[1].daysLimit;
        const ratioB = missedDaysB / b[1].daysLimit;
        return ratioB - ratioA;
    });

    for (const [code, data] of sortedSubjects) {
        const totalClassesMissed = currentClassesMissedCount[code];
        const totalDaysMissed = missedDaysSetBySubject[code].size;
        
        const classesLimit = data.classesLimit;
        const daysLimit = data.daysLimit;
        
        const remainingClasses = classesLimit - totalClassesMissed;
        const remainingDays = daysLimit - totalDaysMissed;
        
        const percentageClasses = classesLimit > 0 ? Math.min((totalClassesMissed / classesLimit) * 100, 100) : 0;
        const percentageDays = daysLimit > 0 ? Math.min((totalDaysMissed / daysLimit) * 100, 100) : 0;

        let statusClass = 'status-safe';
        let progressClass = 'progress-safe';
        
        if (remainingDays <= 0 || remainingClasses <= 0) {
            statusClass = 'status-danger';
            progressClass = 'progress-danger';
        } else if (remainingDays <= daysLimit * 0.25 || remainingClasses <= classesLimit * 0.25) {
            statusClass = 'status-danger';
            progressClass = 'progress-danger';
        } else if (remainingDays <= daysLimit * 0.5 || remainingClasses <= classesLimit * 0.5) {
            statusClass = 'status-warning';
            progressClass = 'progress-warning';
        }

        const card = document.createElement('div');
        card.className = 'summary-card';
        card.setAttribute('data-subject', code);

        // Sort absence dates
        const sortedAbsences = absencesBySubject[code].sort((a, b) => {
            if(a.date === b.date) return a.time.localeCompare(b.time);
            return a.date.localeCompare(b.date);
        });

        let datesHTML = '';
        if (sortedAbsences.length > 0) {
            datesHTML = `
                <div class="absence-dates-toggle" onclick="toggleDates(this)">
                    <span class="arrow">▶</span> Ver histórico de faltas (${totalClassesMissed} aulas em ${totalDaysMissed} dias)
                </div>
                <div class="absence-dates-list">
                    ${sortedAbsences.map(a => `
                        <div class="date-item">
                            <span>${formatDateBR(a.date)}</span>
                            <span class="date-time">${a.time}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        card.innerHTML = `
            <div class="summary-title">
                <span>${data.name}</span>
                <span class="status-badge ${statusClass}">${remainingDays >= 0 ? remainingDays : 0} dias restantes</span>
            </div>
            
            <div class="summary-section-title">Controle de Dias</div>
            <div class="summary-stats">
                <span class="stat-label">Total: ${data.totalDays} dias (${data.daysPerWeek}/sem)</span>
                <span class="stat-label">Limite: ${daysLimit} dias</span>
            </div>
            <div class="summary-stats">
                <span class="stat-value stat-danger">Dias faltados: ${totalDaysMissed}</span>
                <span class="stat-value" style="color: ${remainingDays > 0 ? 'var(--safe-green)' : 'var(--danger-red)'}">Pode faltar: ${Math.max(remainingDays, 0)} dias</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar ${progressClass}" style="width: ${percentageDays}%"></div>
            </div>
            
            <div class="summary-section-title" style="margin-top: 16px;">Controle de Aulas (Horários)</div>
            <div class="summary-stats">
                <span class="stat-label">Total: ${data.totalClasses} aulas</span>
                <span class="stat-label">Limite: ${classesLimit} aulas</span>
            </div>
            <div class="summary-stats">
                <span class="stat-value stat-danger">Aulas faltadas: ${totalClassesMissed}</span>
                <span class="stat-value" style="color: ${remainingClasses > 0 ? 'var(--safe-green)' : 'var(--danger-red)'}">Pode faltar: ${Math.max(remainingClasses, 0)} aulas</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar ${progressClass}" style="width: ${percentageClasses}%"></div>
            </div>
            
            <div style="margin-top: 12px;"></div>
            ${datesHTML}
        `;
        container.appendChild(card);
    }
}

function toggleDates(el) {
    el.classList.toggle('open');
    const list = el.nextElementSibling;
    list.classList.toggle('show');
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

    if (tabName === 'calendar') {
        document.getElementById('tab-calendar').classList.add('active');
        document.querySelectorAll('.nav-item')[0].classList.add('active');

        document.getElementById('header-calendar-nav').style.display = 'flex';
        document.getElementById('header-summary-title').style.display = 'none';

        renderCalendarTab();
    } else {
        document.getElementById('tab-summary').classList.add('active');
        document.querySelectorAll('.nav-item')[1].classList.add('active');

        document.getElementById('header-calendar-nav').style.display = 'none';
        document.getElementById('header-summary-title').style.display = 'flex';

        renderSummary();
    }
}

window.onload = () => {
    renderCalendarTab();
};
