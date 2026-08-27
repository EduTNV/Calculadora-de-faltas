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

// Aulas por semana e cálculo de limite de faltas
// Total de semanas letivas no semestre (20 semanas padrão)
const TOTAL_WEEKS = 20;
const REQUIRED_ATTENDANCE = 0.75; // 75%

// Aulas por semana por matéria (conforme informado)
const classesPerWeek = {
    'go': 4,
    'sai': 11,
    'ped': 4,
    'pesquisa': 3,
    'projeto': 3,
    'med_com': 4
};

// Calcula o limite de faltas: 25% do total de aulas no semestre
function calcAbsenceLimit(weeklyClasses) {
    const totalClasses = weeklyClasses * TOTAL_WEEKS;
    return Math.floor(totalClasses * (1 - REQUIRED_ATTENDANCE));
}

const subjectsData = {
    'go': { name: 'GO', limit: calcAbsenceLimit(classesPerWeek['go']) },
    'sai': { name: 'SAI', limit: calcAbsenceLimit(classesPerWeek['sai']) },
    'ped': { name: 'PED', limit: calcAbsenceLimit(classesPerWeek['ped']) },
    'pesquisa': { name: 'Pesquisa', limit: calcAbsenceLimit(classesPerWeek['pesquisa']) },
    'projeto': { name: 'Projeto', limit: calcAbsenceLimit(classesPerWeek['projeto']) },
    'med_com': { name: 'Med. e Comunidade', limit: calcAbsenceLimit(classesPerWeek['med_com']) }
};

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
        card.innerHTML = `😴 Sem aulas hoje!`;
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

    const currentAbsencesCount = {};
    const absencesBySubject = {};
    Object.keys(subjectsData).forEach(key => {
        currentAbsencesCount[key] = 0;
        absencesBySubject[key] = [];
    });

    absences.forEach(id => {
        const parts = id.split('__');
        if (parts.length === 3) {
            const subjectCode = parts[2];
            if (currentAbsencesCount[subjectCode] !== undefined) {
                currentAbsencesCount[subjectCode]++;
                absencesBySubject[subjectCode].push({
                    date: parts[0],
                    time: parts[1]
                });
            }
        }
    });

    // Sort subjects: most absences first
    const sortedSubjects = Object.entries(subjectsData).sort((a, b) => {
        const ratioA = currentAbsencesCount[a[0]] / a[1].limit;
        const ratioB = currentAbsencesCount[b[0]] / b[1].limit;
        return ratioB - ratioA;
    });

    for (const [code, data] of sortedSubjects) {
        const totalMissed = currentAbsencesCount[code];
        const limit = data.limit;
        const remaining = limit - totalMissed;
        const totalClasses = classesPerWeek[code] * TOTAL_WEEKS;
        const percentage = limit > 0 ? Math.min((totalMissed / limit) * 100, 100) : 0;

        let statusClass = 'status-safe';
        let progressClass = 'progress-safe';
        if (remaining <= 0) {
            statusClass = 'status-danger';
            progressClass = 'progress-danger';
        } else if (remaining <= limit * 0.25) {
            statusClass = 'status-danger';
            progressClass = 'progress-danger';
        } else if (remaining <= limit * 0.5) {
            statusClass = 'status-warning';
            progressClass = 'progress-warning';
        }

        const card = document.createElement('div');
        card.className = 'summary-card';
        card.setAttribute('data-subject', code);

        // Sort absence dates
        const sortedAbsences = absencesBySubject[code].sort((a, b) => a.date.localeCompare(b.date));

        let datesHTML = '';
        if (sortedAbsences.length > 0) {
            datesHTML = `
                <div class="absence-dates-toggle" onclick="toggleDates(this)">
                    <span class="arrow">▶</span> Ver datas das faltas (${sortedAbsences.length})
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
                <span class="status-badge ${statusClass}">${remaining >= 0 ? remaining : 0} restantes</span>
            </div>
            <div class="summary-stats">
                <span class="stat-label">Total: ${totalClasses} aulas (${classesPerWeek[code]}/sem)</span>
                <span class="stat-label">Limite: ${limit} faltas</span>
            </div>
            <div class="summary-stats">
                <span class="stat-value stat-danger">Faltas dadas: ${totalMissed}</span>
                <span class="stat-value" style="color: ${remaining > 0 ? 'var(--safe-green)' : 'var(--danger-red)'}">Pode faltar: ${Math.max(remaining, 0)}</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar ${progressClass}" style="width: ${percentage}%"></div>
            </div>
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