export function exportToExcel(employees, roles, roleFamilies, requirements, reqValues, history) {
  // Build rows for employees sheet
  const rows = employees.map(emp => {
    const role = roles.find(r => r.id === emp.roleId) || {};
    const family = roleFamilies.find(f => f.id === role.familyId) || {};
    const empReqs = reqValues.filter(v => v.employeeId === emp.id);
    const reqCols = {};
    requirements.forEach(req => {
      const val = empReqs.find(v => v.reqId === req.id);
      reqCols[req.name] = val ? val.value : '';
    });
    return {
      'Nombre': emp.name,
      'Email': emp.email,
      'País': emp.country,
      'Área': emp.area,
      'Familia de rol': family.name || '',
      'Rol': role.name || '',
      'Nivel': emp.currentLevel,
      ...reqCols,
    };
  });

  const histRows = history.map(h => {
    const emp = employees.find(e => e.id === h.employeeId) || {};
    const prevRole = roles.find(r => r.id === h.prevRoleId) || {};
    const newRole = roles.find(r => r.id === h.newRoleId) || {};
    return {
      'Colaborador': emp.name || '',
      'Fecha': new Date(h.changeDate).toLocaleDateString('es-CL'),
      'Realizado por': h.changedBy,
      'Rol anterior': prevRole.name || '',
      'Rol nuevo': newRole.name || '',
      'Nivel anterior': h.prevLevel,
      'Nivel nuevo': h.newLevel,
    };
  });

  if (typeof XLSX === 'undefined') {
    alert('Librería de exportación no disponible. En producción usar exceljs o SheetJS.');
    return;
  }

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.json_to_sheet(rows);
  const ws2 = XLSX.utils.json_to_sheet(histRows);
  XLSX.utils.book_append_sheet(wb, ws1, 'Colaboradores');
  XLSX.utils.book_append_sheet(wb, ws2, 'Historial');
  XLSX.writeFile(wb, 'mapeo_competencias.xlsx');
}
