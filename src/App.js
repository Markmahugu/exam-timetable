import React, { useState } from 'react';
import './App.css';

const ExamCalendar = () => {
  // Exam data
  const exams = [
    { id: 1, date: 11, day: 'FRI', month: 4, year: 2025, time: '2pm-4pm', subject: 'Natural Language Processing', venue: 'FLT 19/18', color: '#FF9AA2' },
    { id: 2, date: 15, day: 'TUE', month: 4, year: 2025, time: '11am-1pm', subject: 'Cloud Computing', venue: 'FLT HALL II', color: '#FFB7B2' },
    { id: 3, date: 16, day: 'WED', month: 4, year: 2025, time: '11am-1pm', subject: 'Legal and Ethical Issues in Computing', venue: 'FLT 39', color: '#FFDAC1' },
    { id: 4, date: 17, day: 'THUR', month: 4, year: 2025, time: '8am-10am', subject: 'Computer Graphics', venue: 'EH(MENS)', color: '#E2F0CB' },
    { id: 5, date: 24, day: 'THUR', month: 4, year: 2025, time: '11am-1pm', subject: 'Assembly Programming', venue: 'FLT 39', color: '#B5EAD7' },
    { id: 6, date: 25, day: 'FRI', month: 4, year: 2025, time: '2pm-4pm', subject: 'Telecommunication Switching and Transmission System', venue: 'INDOOR ARENA', color: '#C7CEEA' }
  ];

  const [selectedExam, setSelectedExam] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const [currentMonth] = useState(4); // April
  const [currentYear] = useState(2025);

  // Calculate progress
  const totalExams = exams.length;
  const completedExams = exams.filter(exam => {
    const examDate = new Date(exam.year, exam.month - 1, exam.date);
    return examDate < new Date();
  }).length;
  const progress = Math.round((completedExams / totalExams) * 100);

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  
  // Create calendar grid
  const calendarDays = [];
  const emptyDays = (firstDayOfMonth + 6) % 7; // Adjust to start week on Monday
  
  // Add empty cells for days before the 1st of the month
  for (let i = 0; i < emptyDays; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }
  
  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayExams = exams.filter(exam => exam.date === day);
    const isToday = new Date().getDate() === day && 
                    new Date().getMonth() + 1 === currentMonth && 
                    new Date().getFullYear() === currentYear;
    const isPast = new Date(currentYear, currentMonth - 1, day) < new Date();
    
    calendarDays.push(
      <div 
        key={`day-${day}`}
        className={`calendar-day ${dayExams.length ? 'has-exam' : ''} ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}
        onClick={() => {
          if (dayExams.length) {
            setSelectedExam(dayExams[0]);
            if (day === 25) { // Last exam
              setCelebrate(true);
              setTimeout(() => setCelebrate(false), 5000);
            }
          }
        }}
      >
        <div className="day-number">{day}</div>
        {isPast && (
          <div className="x-overlay">
            <div className="x-line x-line-1"></div>
            <div className="x-line x-line-2"></div>
          </div>
        )}
        {dayExams.length > 0 && (
          <div className="exam-indicator" style={{ backgroundColor: dayExams[0].color }}>
            <div className="exam-time">{dayExams[0].time}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="exam-calendar-container">
      <h1>📚 April 2025 Final year Exam Timetable 🎓</h1>
      <p className="subtitle">You've got this! {totalExams - completedExams} exams to go!</p>
      
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}>
          <span className="progress-text">{progress}% Done!</span>
        </div>
      </div>
      
      <div className="calendar-header">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="calendar-header-day">{day}</div>
        ))}
      </div>
      
      <div className="calendar-grid">
        {calendarDays}
      </div>
      
      {selectedExam && (
        <div className="exam-details" style={{ borderColor: selectedExam.color }}>
          <button className="close-btn" onClick={() => setSelectedExam(null)}>×</button>
          <h2>{selectedExam.subject}</h2>
          <div className="detail-row">
            <span className="detail-icon">📅</span>
            <span className="detail-text">{selectedExam.date}th {selectedExam.day}, April 2025</span>
          </div>
          <div className="detail-row">
            <span className="detail-icon">⏰</span>
            <span className="detail-text">{selectedExam.time}</span>
          </div>
          <div className="detail-row venue-row">
            <span className="detail-icon">🏛️</span>
            <span className="detail-text">{selectedExam.venue}</span>
          </div>
          <p className="motivation">
            {selectedExam.date === 25 ? 
              "Last exam! Almost there! 🎉" : 
              selectedExam.date === 11 ? 
              "First exam! You'll do great! 💪" : 
              "Keep going! You're making progress! ✨"}
          </p>
        </div>
      )}

      {celebrate && (
        <div className="confetti-container">
          {[...Array(100)].map((_, i) => (
            <div 
              key={i} 
              className="confetti" 
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`
              }}
            />
          ))}
          <div className="celebration-text">🎉 Final Exam! Freedom is near! 🎉</div>
        </div>
      )}
    </div>
  );
};

export default ExamCalendar;