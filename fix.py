f = open('app/(officer)/officer/page.tsx', 'w', encoding='utf-8')
f.write(''''use client';
import React from 'react';
import ComplaintQueueCard from '@/components/complaints/ComplaintQueueCard';

export default function OfficerQueuePage() {
  const [complaints, setComplaints] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem('nyayasetu_token');
    fetch('/api/officer/queue', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json())
      .then(d => { setComplaints(d.complaints || []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>My Complaint Queue</h1>
      {loading && <p>Loading...</p>}
      {error && <p className='text-red-500'>{error}</p>}
      {!loading && !error && complaints.length === 0 && <p>No complaints.</p>}
      {!loading && !error && complaints.map(c => <ComplaintQueueCard key={c.id} complaint={c} />)}
    </div>
  );
}
''')
f.close()
print('Done')
