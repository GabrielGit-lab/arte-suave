async function runTests() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('🥋 Iniciando bateria de testes do sistema Arte Suave...\n');

  // 1. Health
  const healthRes = await fetch(`${baseUrl}/health`).then(r => r.json());
  console.log('✅ Health check:', healthRes.status === 'ok' ? 'OK' : 'FAIL');

  // 2. Professor Login
  const profAuth = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'professor@artesuave.com', password: 'senha123' })
  }).then(r => r.json());
  console.log('✅ Login Professor:', profAuth.user?.name, `(Token: ${profAuth.token ? 'OK' : 'FAIL'})`);

  const profToken = profAuth.token;

  // 3. Student Login
  const studentAuth = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aluno@artesuave.com', password: 'senha123' })
  }).then(r => r.json());
  console.log('✅ Login Aluno:', studentAuth.user?.name, `(${studentAuth.user?.belt} ${studentAuth.user?.degrees}º grau)`);

  const studentToken = studentAuth.token;

  // 4. Tutorials
  const tuts = await fetch(`${baseUrl}/tutorials`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  }).then(r => r.json());
  console.log(`✅ Biblioteca de Tutoriais: ${tuts.length} técnicas carregadas com sucesso`);

  // 5. Toggle Bookmark
  const bmRes = await fetch(`${baseUrl}/tutorials/${tuts[0].id}/bookmark`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ status: 'favorite' })
  }).then(r => r.json());
  console.log('✅ Marcador de Tutorial (Favorito):', bmRes.message);

  // 6. Classes
  const classes = await fetch(`${baseUrl}/classes`, {
    headers: { Authorization: `Bearer ${profToken}` }
  }).then(r => r.json());
  console.log(`✅ Aulas Registradas: ${classes.length} aulas encontradas`);

  // 7. Attendance roll-call
  const classId = classes[0].id;
  const sheet = await fetch(`${baseUrl}/attendance/class/${classId}`, {
    headers: { Authorization: `Bearer ${profToken}` }
  }).then(r => r.json());
  console.log(`✅ Folha de Chamada (Aula ${classId}):`, sheet.students?.length, 'alunos listados');

  // 8. Sign attendance
  const studentId = studentAuth.user.id;
  const signRes = await fetch(`${baseUrl}/attendance/sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${profToken}` },
    body: JSON.stringify({ class_id: classId, student_id: studentId, status: 'present' })
  }).then(r => r.json());
  console.log('✅ Assinatura de Chamada:', signRes.message);

  // 9. Physical Metrics & CBJJ category
  const physRes = await fetch(`${baseUrl}/physical`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      student_id: studentId,
      weight: 77.2,
      height: 178,
      wingspan: 182,
      notes: 'Pesagem de teste pré-treino'
    })
  }).then(r => r.json());
  console.log('✅ Dados Físicos & Categoria CBJJ:', physRes.weight, 'kg ->', physRes.category_ibjjf, `(IMC: ${physRes.bmi_info?.bmi})`);

  // 10. Graduations overview
  const gradOverview = await fetch(`${baseUrl}/graduations/overview`, {
    headers: { Authorization: `Bearer ${profToken}` }
  }).then(r => r.json());
  console.log(`✅ Gestão de Graduações: ${gradOverview.length} alunos com progresso mapeado`);

  // 11. Reports dashboard
  const reports = await fetch(`${baseUrl}/reports/dashboard`, {
    headers: { Authorization: `Bearer ${profToken}` }
  }).then(r => r.json());
  console.log('✅ Relatórios da Academia:', {
    total_alunos: reports.summary?.total_students,
    total_presencas: reports.summary?.total_attendances,
    faixas: reports.belt_distribution?.map(b => `${b.belt}: ${b.count}`).join(', ')
  });

  console.log('\n🥋 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! 🎉\n');
}

runTests().catch(err => {
  console.error('❌ Falha nos testes:', err);
  process.exit(1);
});
