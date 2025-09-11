import React from 'react';

function csvToJson(csv) {
  const [header, ...rows] = csv.trim().split('\n').map(row => row.split(','));
  return rows.map(row =>
    Object.fromEntries(header.map((key, i) => [key.trim(), row[i]?.trim()]))
  );
}

const InputPlayGroups = () => {
  const handleImport = async () => {
    const url = 'https://docs.google.com/spreadsheets/d/1bQh9RhomYeGa4f4dY1CUiBa9o4-chA7DLk9g6sFolQk/export?format=csv';
    const res = await fetch(url);
    const csv = await res.text();
    const json = csvToJson(csv);
    localStorage.setItem('teamData', JSON.stringify(json));
    alert('Team data imported to localStorage!');
  };

  return (
    <div>
      <h1>Input Playing Groups</h1>
      <button onClick={handleImport}>Import Team Info from Google Sheet</button>
      {/* ...rest of your component... */}
    </div>
  );
};

export default InputPlayGroups;