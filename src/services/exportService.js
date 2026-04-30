import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';

/**
 * Generate and share an Excel report from reports data
 */
export const exportReportsToExcel = async (reports, filename = 'LUCT_Reports') => {
  try {
    const rows = reports.map((r, i) => ({
      '#': i + 1,
      'Faculty': r.facultyName || '',
      'Class Name': r.className || '',
      'Week': r.weekOfReporting || '',
      'Date': r.dateOfLecture ? new Date(r.dateOfLecture.seconds * 1000).toLocaleDateString() : '',
      'Course Name': r.courseName || '',
      'Course Code': r.courseCode || '',
      'Lecturer': r.lecturerName || '',
      'Students Present': r.actualStudentsPresent || 0,
      'Registered Students': r.totalRegisteredStudents || 0,
      'Attendance %': r.totalRegisteredStudents
        ? `${((r.actualStudentsPresent / r.totalRegisteredStudents) * 100).toFixed(1)}%`
        : 'N/A',
      'Venue': r.venue || '',
      'Scheduled Time': r.scheduledLectureTime || '',
      'Topic Taught': r.topicTaught || '',
      'Learning Outcomes': r.learningOutcomes || '',
      'Recommendations': r.recommendations || '',
      'PRL Feedback': r.prlFeedback || '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reports');

    // Style header row
    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '002147' } },
      };
    }

    // Set column widths
    ws['!cols'] = [
      { wch: 4 }, { wch: 20 }, { wch: 15 }, { wch: 8 }, { wch: 12 },
      { wch: 25 }, { wch: 12 }, { wch: 20 }, { wch: 16 }, { wch: 18 },
      { wch: 12 }, { wch: 16 }, { wch: 15 }, { wch: 30 }, { wch: 30 },
      { wch: 30 }, { wch: 30 },
    ];

    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const uri = FileSystem.cacheDirectory + `${filename}_${Date.now()}.xlsx`;
    await FileSystem.writeAsStringAsync(uri, wbout, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Export LUCT Reports',
        UTI: 'com.microsoft.excel.xlsx',
      });
    }
    return true;
  } catch (error) {
    console.error('exportReportsToExcel error:', error);
    throw new Error('Failed to export reports. Please try again.');
  }
};

/**
 * Export attendance data to Excel
 */
export const exportAttendanceToExcel = async (attendanceData, filename = 'LUCT_Attendance') => {
  try {
    const rows = attendanceData.map((a, i) => ({
      '#': i + 1,
      'Student Name': a.studentName || '',
      'Student ID': a.studentId || '',
      'Status': a.status === 'present' ? 'Present' : 'Absent',
      'Date': a.timestamp ? new Date(a.timestamp.seconds * 1000).toLocaleDateString() : '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const uri = FileSystem.cacheDirectory + `${filename}_${Date.now()}.xlsx`;
    await FileSystem.writeAsStringAsync(uri, wbout, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Export Attendance',
      });
    }
    return true;
  } catch (error) {
    throw new Error('Failed to export attendance.');
  }
};
