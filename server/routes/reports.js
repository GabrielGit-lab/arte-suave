const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/reports/dashboard - Statistics and reports
router.get('/dashboard', authenticateToken, (req, res) => {
  const isProfessor = req.user.role === 'professor';

  // 1. Belt distribution
  const beltDistribution = db.prepare(`
    SELECT belt, COUNT(*) as count
    FROM users
    WHERE role = 'student'
    GROUP BY belt
    ORDER BY 
      CASE belt
        WHEN 'Branca' THEN 1
        WHEN 'Azul' THEN 2
        WHEN 'Roxa' THEN 3
        WHEN 'Marrom' THEN 4
        WHEN 'Preta' THEN 5
        ELSE 6
      END
  `).all();

  // 2. Attendance ranking / top students
  const topAttendees = db.prepare(`
    SELECT 
      u.id, u.name, u.belt, u.degrees, u.avatar,
      COUNT(a.id) as attendances_count
    FROM users u
    JOIN attendances a ON a.student_id = u.id AND a.status = 'present'
    WHERE u.role = 'student'
    GROUP BY u.id
    ORDER BY attendances_count DESC
    LIMIT 5
  `).all();

  // 3. Total active students, total classes, total attendances
  const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get().count;
  const totalClasses = db.prepare("SELECT COUNT(*) as count FROM classes").get().count;
  const totalAttendances = db.prepare("SELECT COUNT(*) as count FROM attendances WHERE status = 'present'").get().count;
  const totalTutorials = db.prepare("SELECT COUNT(*) as count FROM tutorials").get().count;

  // 4. Attendance history by class date (recent trend)
  const recentAttendanceTrend = db.prepare(`
    SELECT c.date, c.title, COUNT(a.id) as present_count
    FROM classes c
    LEFT JOIN attendances a ON a.class_id = c.id AND a.status = 'present'
    GROUP BY c.id
    ORDER BY c.date DESC
    LIMIT 10
  `).all().reverse();

  // 5. Eligible students for graduation
  const allStudents = db.prepare(`
    SELECT u.id, u.name, u.belt, u.degrees,
      (SELECT COUNT(*) FROM attendances a WHERE a.student_id = u.id AND a.status = 'present') as total_attendances
    FROM users u
    WHERE u.role = 'student'
  `).all();

  const eligibleForGraduation = allStudents.filter(s => {
    let required = 30;
    if (s.belt === 'Azul') required = 60;
    if (s.belt === 'Roxa') required = 80;
    if (s.belt === 'Marrom') required = 100;
    return s.total_attendances >= (s.degrees + 1) * required;
  });

  // 6. Student-specific data if request is by a student
  let studentStats = null;
  if (!isProfessor) {
    const studentId = req.user.id;
    const userAttendanceCount = db.prepare('SELECT COUNT(*) as count FROM attendances WHERE student_id = ? AND status = "present"').get(studentId).count;
    const userPracticedTechs = db.prepare('SELECT COUNT(*) as count FROM tutorial_bookmarks WHERE user_id = ? AND status = "practiced"').get(studentId).count;
    const userFavorites = db.prepare('SELECT COUNT(*) as count FROM tutorial_bookmarks WHERE user_id = ? AND status = "favorite"').get(studentId).count;

    const userAttendancesByMonth = db.prepare(`
      SELECT strftime('%Y-%m', c.date) as month, COUNT(a.id) as count
      FROM attendances a
      JOIN classes c ON a.class_id = c.id
      WHERE a.student_id = ? AND a.status = 'present'
      GROUP BY month
      ORDER BY month ASC
      LIMIT 6
    `).all(studentId);

    const weightHistory = db.prepare(`
      SELECT recorded_at, weight
      FROM physical_records
      WHERE student_id = ?
      ORDER BY recorded_at ASC
    `).all(studentId);

    studentStats = {
      total_attendances: userAttendanceCount,
      practiced_techniques: userPracticedTechs,
      favorite_techniques: userFavorites,
      monthly_attendance: userAttendancesByMonth,
      weight_history: weightHistory
    };
  }

  res.json({
    isProfessor,
    summary: {
      total_students: totalStudents,
      total_classes: totalClasses,
      total_attendances: totalAttendances,
      total_tutorials: totalTutorials,
      eligible_count: eligibleForGraduation.length
    },
    belt_distribution: beltDistribution,
    top_attendees: topAttendees,
    attendance_trend: recentAttendanceTrend,
    eligible_students: eligibleForGraduation,
    student_stats: studentStats
  });
});

module.exports = router;
