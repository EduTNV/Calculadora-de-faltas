/* =========================================
   LÓGICA DO APP (JavaScript)
   ========================================= */

const subjectAcronyms = {
    'sai': 'SAI',
    'saude_mulher': 'S. MULHER',
    'med_com': 'MED COM',
    'pesq_saude': 'PESQUISA',
    'saude_crianca': 'S. CRIANÇA',
    'proj_ext': 'EXTENSÃO',
    'med_legal': 'MED LEGAL'
};

const weeklySchedule = {
    1: [
        { time: '08h20-09h10', code: 'sai' },
        { time: '09h10-10h00', code: 'sai' },
        { time: '10h00-10h50', code: 'saude_mulher' },
        { time: '10h50-11h40', code: 'saude_mulher' },
        { time: '13h30-14h20', code: 'med_com' },
        { time: '14h20-15h10', code: 'med_com' },
        { time: '15h10-16h00', code: 'med_com' },
        { time: '16h00-16h50', code: 'med_com' }
    ],
    2: [
        { time: '07h30-08h20', code: 'sai' },
        { time: '08h20-09h10', code: 'sai' },
        { time: '09h10-10h00', code: 'sai' },
        { time: '10h00-10h50', code: 'sai' },
        { time: '10h50-11h40', code: 'sai' },
        { time: '11h40-12h30', code: 'sai' },
        { time: '13h30-14h20', code: 'sai' },
        { time: '14h20-15h10', code: 'sai' },
        { time: '15h10-16h00', code: 'sai' },
        { time: '16h00-16h50', code: 'sai' },
        { time: '16h50-17h40', code: 'sai' }
    ],
    3: [
        { time: '07h30-08h20', code: 'pesq_saude' },
        { time: '08h20-09h10', code: 'pesq_saude' },
        { time: '09h10-10h00', code: 'pesq_saude' },
        { time: '10h00-10h50', code: 'sai' },
        { time: '10h50-11h40', code: 'sai' }
    ],
    4: [
        { time: '07h30-08h20', code: 'saude_crianca' },
        { time: '08h20-09h10', code: 'saude_crianca' },
        { time: '10h00-10h50', code: 'saude_mulher' },
        { time: '10h50-11h40', code: 'saude_mulher' },
        { time: '13h30-14h20', code: 'proj_ext' },
        { time: '14h20-15h10', code: 'proj_ext' },
        { time: '15h10-16h00', code: 'proj_ext' },
        { time: '16h00-16h50', code: 'med_legal' },
        { time: '16h50-17h40', code: 'med_legal' },
        { time: '17h40-18h30', code: 'med_legal' }
    ],
    5: [
        { time: '13h30-14h20', code: 'saude_crianca' },
        { time: '14h20-15h10', code: 'saude_crianca' },
        { time: '16h00-16h50', code: 'sai' },
        { time: '16h50-17h40', code: 'sai' }
    ]
};

const calcLimit = (hours) => Math.floor((hours * 60) / 50);

const subjectsData = {
    'med_com': { name: 'Medicina e Comunidade', limit: calcLimit(20) },
    'med_legal': { name: 'Medicina Legal', limit: calcLimit(15) },
    'pesq_saude': { name: 'Pesquisa em Saúde', limit: calcLimit(15) },
    'proj_ext': { name: 'Projeto de Extensão', limit: calcLimit(15) },
    'saude_crianca': { name: 'Saúde da Criança e Adolescente', limit: calcLimit(20) },
    'saude_mulher': { name: 'Saúde da Mulher', limit: calcLimit(20) },
    'sai': { name: 'SAI', limit: calcLimit(55) }
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
    if (selectedDate.getFullYear() > 2026 || (selectedDate.getFullYear() === 2026 && selectedDate.getMonth() > 6)) {
        selectedDate.setFullYear(2026);
        selectedDate.setMonth(6);
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
    const maxWeekMonday = getMonday(new Date(2026, 6, 31));

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

function renderSummary() {
    const container = document.getElementById('summary-container');
    container.innerHTML = '';

    const currentAbsencesCount = {};
    Object.keys(subjectsData).forEach(key => currentAbsencesCount[key] = 0);
    
    absences.forEach(id => {
        const parts = id.split('__');
        if (parts.length === 3) {
            const subjectCode = parts[2]; 
            if (currentAbsencesCount[subjectCode] !== undefined) {
                currentAbsencesCount[subjectCode]++;
            }
        }
    });

    for (const [code, data] of Object.entries(subjectsData)) {
        const totalMissed = currentAbsencesCount[code];
        const limit = data.limit;
        const remaining = limit - totalMissed;
        
        let statusClass = 'status-safe';
        if (remaining <= limit * 0.25) statusClass = 'status-danger';
        else if (remaining <= limit * 0.5) statusClass = 'status-warning';

        const card = document.createElement('div');
        card.className = 'summary-card';
        card.innerHTML = `
            <div class="summary-title">
                <span>${data.name}</span>
                <span class="status-badge ${statusClass}">${remaining} rest.</span>
            </div>
            <div class="summary-stats">
                <span style="color: var(--text-muted)">Limite: ${limit} faltas</span>
                <span style="color: var(--danger-red); font-weight: 500;">Faltas Dadas: ${totalMissed}</span>
            </div>
        `;
        container.appendChild(card);
    }
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