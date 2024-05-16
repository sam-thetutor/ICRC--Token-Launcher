import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function ExcelUploader() {
  const [excelData, setExcelData] = useState([]);
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      setExcelData(parsedData.slice(1)); // Skip header row
    };
    
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="container mx-auto my-8">
      <input type="file" onChange={handleFileUpload} className="mb-4" />
      
      {excelData.length > 0 && (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {excelData.map((row, index) => (
              <tr key={index}>
                <td className="px-4 py-2">{row[0]}</td>
                <td className="px-4 py-2">{row[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ExcelUploader;